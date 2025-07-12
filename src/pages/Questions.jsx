@@ .. @@
-import React from 'react';
+import React, { useState, useEffect } from 'react';
 import Navbar from '../components/Navbar';
 import Sidebar from '../components/Sidebar';
 import QuestionCard from '../components/QuestionCard';
 import CommunityInfo from '../components/CommunityInfo';
+import ProtectedRoute from '../components/ProtectedRoute';
+import { questionAPI } from '../services/api';
 
 const Questions = () => {
-  const sampleQuestions = [
-    {
-      id: 1,
-      title: "How to implement authentication in React?",
-      content: "I'm building a React application and need to implement user authentication. What are the best practices for handling login, logout, and protecting routes?",
-      author: "johndoe",
-      votes: 15,
-      answers: 8,
-      views: 342,
-      tags: ["react", "authentication", "javascript"],
-      timestamp: "2 hours ago"
-    },
-    {
-      id: 2,
-      title: "Best practices for state management in large applications",
-      content: "What are the recommended approaches for managing state in large-scale React applications? Should I use Redux, Context API, or something else?",
-      author: "developer123",
-      votes: 23,
-      answers: 12,
-      views: 567,
-      tags: ["react", "state-management", "redux"],
-      timestamp: "4 hours ago"
-    },
-    {
-      id: 3,
-      title: "How to optimize React performance for large lists?",
-      content: "I have a component that renders thousands of items and it's getting slow. What are the best techniques to optimize performance?",
-      author: "codemaster",
-      votes: 31,
-      answers: 15,
-      views: 789,
-      tags: ["react", "performance", "optimization"],
-      timestamp: "6 hours ago"
-    },
-    {
-      id: 4,
-      title: "TypeScript vs JavaScript: When to use which?",
-      content: "I'm deciding whether to use TypeScript or stick with JavaScript for my next project. What are the pros and cons of each?",
-      author: "webdev_pro",
-      votes: 42,
-      answers: 20,
-      views: 1234,
-      tags: ["typescript", "javascript", "development"],
-      timestamp: "1 day ago"
-    }
-  ];
+  const [questions, setQuestions] = useState([]);
+  const [loading, setLoading] = useState(true);
+  const [error, setError] = useState('');
+  const [currentPage, setCurrentPage] = useState(1);
+  const [totalCount, setTotalCount] = useState(0);
+
+  useEffect(() => {
+    fetchQuestions();
+  }, [currentPage]);
+
+  const fetchQuestions = async () => {
+    try {
+      setLoading(true);
+      const response = await questionAPI.getQuestions(currentPage, 10);
+      
+      if (response.question_items) {
+        setQuestions(response.question_items);
+        setTotalCount(response.total_count || 0);
+      } else {
+        setQuestions([]);
+      }
+    } catch (err) {
+      setError(err.message);
+      setQuestions([]);
+    } finally {
+      setLoading(false);
+    }
+  };
+
+  const formatTimestamp = (dateString) => {
+    const date = new Date(dateString);
+    const now = new Date();
+    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
+    
+    if (diffInHours < 1) return 'Just now';
+    if (diffInHours < 24) return `${diffInHours} hours ago`;
+    const diffInDays = Math.floor(diffInHours / 24);
+    return `${diffInDays} days ago`;
+  };
 
   return (
-    <div className="min-h-screen bg-gray-50">
-      <Navbar />
-      <Sidebar />
-      
-      <main className="ml-64 pt-20 p-8">
-        <div className="flex gap-8">
-          <div className="flex-1">
-            <div className="mb-8">
-              <h1 className="text-3xl font-bold text-gray-900 mb-2">Popular Questions</h1>
-              <p className="text-gray-600">Browse through the most asked and trending questions</p>
-            </div>
-            
-            <div className="space-y-6">
-              {sampleQuestions.map((question) => (
-                <QuestionCard key={question.id} {...question} />
-              ))}
+    <ProtectedRoute>
+      <div className="min-h-screen bg-gray-50">
+        <Navbar />
+        <Sidebar />
+        
+        <main className="ml-64 pt-20 p-8">
+          <div className="flex gap-8">
+            <div className="flex-1">
+              <div className="mb-8">
+                <h1 className="text-3xl font-bold text-gray-900 mb-2">Popular Questions</h1>
+                <p className="text-gray-600">Browse through the most asked and trending questions</p>
+              </div>
+              
+              {loading ? (
+                <div className="text-center py-8">
+                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
+                  <p className="text-gray-600">Loading questions...</p>
+                </div>
+              ) : error ? (
+                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
+                  Error: {error}
+                </div>
+              ) : questions.length === 0 ? (
+                <div className="text-center py-8">
+                  <p className="text-gray-600">No questions found. Be the first to ask a question!</p>
+                </div>
+              ) : (
+                <div className="space-y-6">
+                  {questions.map((question) => (
+                    <QuestionCard 
+                      key={question.question_id} 
+                      id={question.question_id}
+                      title={question.title}
+                      content={question.content}
+                      author={question.user_id}
+                      votes={question.upvote}
+                      answers={0} // Backend doesn't provide answer count yet
+                      views={Math.floor(Math.random() * 1000)} // Placeholder since backend doesn't track views
+                      tags={question.tags || []}
+                      timestamp={formatTimestamp(question.created_at)}
+                    />
+                  ))}
+                </div>
+              )}
             </div>
-          </div>
-          
-          <aside className="w-80">
-            <CommunityInfo
-              communityName="React Developers"
-              followers={15432}
-              moderators={12}
-              isJoined={false}
-            />
-          </aside>
-        </div>
-      </main>
-    </div>
+            
+            <aside className="w-80">
+              <CommunityInfo
+                communityName="React Developers"
+                followers={15432}
+                moderators={12}
+                isJoined={false}
+              />
+            </aside>
+          </div>
+        </main>
+      </div>
+    </ProtectedRoute>
   );
 };
 
 export default Questions;