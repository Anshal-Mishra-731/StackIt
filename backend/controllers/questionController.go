package controllers

import (
	"context"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/JagdeepSingh13/go_jwt/database"
	"github.com/JagdeepSingh13/go_jwt/models"
	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var questionCollection *mongo.Collection = database.OpenCollection(database.Client, "question")

func CreateQuestion() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()
		var question models.Question

		// Bind JSON to Question model
		if err := c.BindJSON(&question); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		// Extract user ID from JWT context (set by middleware)
		userID := c.GetString("uid")
		if userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: user ID not found"})
			return
		}

		// Handle image upload
		file, _, err := c.Request.FormFile("image")
		if err == nil {
			defer file.Close()
			cld, _ := cloudinary.NewFromParams(
				os.Getenv("CLOUDINARY_CLOUD_NAME"),
				os.Getenv("CLOUDINARY_API_KEY"),
				os.Getenv("CLOUDINARY_API_SECRET"),
			)
			uploadResult, err := cld.Upload.Upload(ctx, file, uploader.UploadParams{})
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Image upload failed"})
				return
			}
			question.ImageUrl = &uploadResult.SecureURL
		}

		// Validate the Question struct
		validateErr := validate.Struct(question)
		if validateErr != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": validateErr.Error()})
			return
		}

		// Set fields
		question.ID = primitive.NewObjectID()
		question.Question_id = question.ID.Hex()
		question.Created_at, _ = time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
		question.Updated_at, _ = time.Parse(time.RFC3339, time.Now().Format(time.RFC3339))
		question.Upvote = 0
		question.IsPinned = false
		question.User_id = userID

		// Insert into MongoDB
		result, err := questionCollection.InsertOne(ctx, question)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create question"})
			return
		}

		c.JSON(http.StatusOK, result)
	}
}

func GetQuestions() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)

		recordpage, err := strconv.Atoi(c.Query("recordPerPage"))
		if err != nil || recordpage < 1 {
			recordpage = 10
		}
		page, err1 := strconv.Atoi(c.Query("page"))
		if err1 != nil || page < 1 {
			page = 1
		}

		startIndex := (page - 1) * recordpage
		// startIndex, err = strconv.Atoi(c.Query("startIndex"))

		matchStage := bson.D{{"$match", bson.D{{}}}}
		groupStage := bson.D{
			{"$group", bson.D{
				{"_id", bson.D{
					{"_id", "null"},
				}},
				{"total_count", bson.D{{"$sum", 1}}},
				{"data", bson.D{{"$push", "$$ROOT"}}},
			}},
		}
		projectStage := bson.D{
			{"$project", bson.D{
				{"_id", 0},
				{"total_count", 1},
				{"question_items", bson.D{{"$slice", []interface{}{"$data", startIndex, recordpage}}}},
			}},
		}

		result, err := questionCollection.Aggregate(ctx, mongo.Pipeline{
			matchStage, groupStage, projectStage,
		})
		defer cancel()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "error occured while listing questions"})
		}

		var allQuestions []bson.M
		if err = result.All(ctx, &allQuestions); err != nil {
			log.Fatal(err)
		}
		c.JSON(http.StatusOK, allQuestions[0])
	}
}

func GetQuestionByID() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		var question models.Question

		questionId := c.Param("question_id")

		err := questionCollection.FindOne(ctx, bson.M{"question_id": questionId}).Decode(&question)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "unable to get question from given Id"})
			return
		}
		c.JSON(http.StatusOK, question)
	}
}

func GetQuestionsByUser() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		userId := c.Param("user_id")
		filter := bson.M{"user_id": userId}
		cursor, err := questionCollection.Find(ctx, filter)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch questions"})
			return
		}
		defer cursor.Close(ctx)

		var userQuestions []models.Question
		if err := cursor.All(ctx, &userQuestions); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode questions"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"questions": userQuestions})
	}
}

func DeleteQuestion() gin.HandlerFunc {
	return func(c *gin.Context) {

	}
}

func UpdateQuestion() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ctx, cancel = context.WithTimeout(context.Background(), 100*time.Second)
		defer cancel()

		// var question models.Question
		questionId := c.Param("question_id")
		// if err := c.BindJSON(&question); err != nil {
		// 	c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		// 	return
		// }

		filter := bson.M{"question_id": questionId}
		update := bson.M{
			"$inc": bson.M{"upvote": 1},
			"$set": bson.M{"updated_at": time.Now()},
		}

		result, err := questionCollection.UpdateOne(ctx, filter, update)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upvote question"})
			return
		}

		if result.MatchedCount == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Question not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Question upvoted successfully"})
	}
}
