@@ .. @@
 import React, { useState } from 'react';
 import { useNavigate } from 'react-router-dom';
 import Navbar from '../components/Navbar';
 import Sidebar from '../components/Sidebar';
 import RichTextEditor from '../components/RichTextEditor';
+import ProtectedRoute from '../components/ProtectedRoute';
+import { questionAPI } from '../services/api';
 
 const AskQuestion = () => {
   const navigate = useNavigate();
   const [title, setTitle] = useState('');
   const [content, setContent] = useState('');
   const [tags, setTags] = useState('');
+  const [loading, setLoading] = useState(false);
+  const [error, setError] = useState('');
 
   const handleSubmit = async (e) => {
     e.preventDefault();
-    // Here you would typically send the data to your backend
-    console.log({ title, content, tags });
-    // Redirect to questions page after submission
-    navigate('/questions');
+    setLoading(true);
+    setError('');
+
+    try {
+      const questionData = {
+        title,
+        content,
+        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
+      };
+
+      await questionAPI.createQuestion(questionData);
+      navigate('/questions');
+    } catch (err) {
+      setError(err.message);
+    } finally {
+      setLoading(false);
+    }
   };
 
   return (
-    <div className="min-h-screen bg-gray-50">
-      <Navbar />
-      <Sidebar />
-      
-      <main className="ml-64 pt-20 p-8">
-        <div className="max-w-4xl mx-auto">
-          <div className="mb-8">
-            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ask a Question</h1>
-            <p className="text-gray-600">Share your question with the community and get helpful answers</p>
-          </div>
-          
-          <form onSubmit={handleSubmit} className="space-y-6">
-            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
-              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
-                Question Title
-              </label>
-              <input
-                type="text"
-                id="title"
-                value={title}
-                onChange={(e) => setTitle(e.target.value)}
-                placeholder="What's your question? Be specific and clear..."
-                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
-                maxLength={150}
-                required
-              />
-              <p className="mt-2 text-sm text-gray-500">
-                {title.length}/150 characters
-              </p>
-            </div>
+    <ProtectedRoute>
+      <div className="min-h-screen bg-gray-50">
+        <Navbar />
+        <Sidebar />
+        
+        <main className="ml-64 pt-20 p-8">
+          <div className="max-w-4xl mx-auto">
+            <div className="mb-8">
+              <h1 className="text-3xl font-bold text-gray-900 mb-2">Ask a Question</h1>
+              <p className="text-gray-600">Share your question with the community and get helpful answers</p>
+            </div>
+            
+            {error && (
+              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
+                Error: {error}
+              </div>
+            )}
+            
+            <form onSubmit={handleSubmit} className="space-y-6">
+              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
+                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
+                  Question Title
+                </label>
+                <input
+                  type="text"
+                  id="title"
+                  value={title}
+                  onChange={(e) => setTitle(e.target.value)}
+                  placeholder="What's your question? Be specific and clear..."
+                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
+                  maxLength={150}
+                  required
+                />
+                <p className="mt-2 text-sm text-gray-500">
+                  {title.length}/150 characters
+                </p>
+              </div>
 
-            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
-              <label className="block text-sm font-medium text-gray-700 mb-2">
-                Question Details
-              </label>
-              <p className="text-sm text-gray-500 mb-4">
-                Provide all the details about your question. Include what you've tried, what you expected to happen, and what actually happened.
-              </p>
-              <RichTextEditor
-                value={content}
-                onChange={setContent}
-                placeholder="Describe your question in detail. Include code snippets, error messages, or any relevant information..."
-                height="400px"
-              />
-            </div>
+              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
+                <label className="block text-sm font-medium text-gray-700 mb-2">
+                  Question Details
+                </label>
+                <p className="text-sm text-gray-500 mb-4">
+                  Provide all the details about your question. Include what you've tried, what you expected to happen, and what actually happened.
+                </p>
+                <RichTextEditor
+                  value={content}
+                  onChange={setContent}
+                  placeholder="Describe your question in detail. Include code snippets, error messages, or any relevant information..."
+                  height="400px"
+                />
+              </div>
 
-            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
-              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
-                Tags
-              </label>
-              <input
-                type="text"
-                id="tags"
-                value={tags}
-                onChange={(e) => setTags(e.target.value)}
-                placeholder="Add up to 5 tags (e.g., react, javascript, authentication)"
-                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
-              />
-              <p className="mt-2 text-sm text-gray-500">
-                Use tags to help others find your question. Separate tags with commas.
-              </p>
-            </div>
+              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
+                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
+                  Tags
+                </label>
+                <input
+                  type="text"
+                  id="tags"
+                  value={tags}
+                  onChange={(e) => setTags(e.target.value)}
+                  placeholder="Add up to 5 tags (e.g., react, javascript, authentication)"
+                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
+                />
+                <p className="mt-2 text-sm text-gray-500">
+                  Use tags to help others find your question. Separate tags with commas.
+                </p>
+              </div>
 
-            <div className="flex items-center justify-between">
-              <button
-                type="button"
-                onClick={() => navigate('/questions')}
-                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
-              >
-                Cancel
-              </button>
-              <button
-                type="submit"
-                disabled={!title.trim() || !content.trim()}
-                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200"
-              >
-                Post Question
-              </button>
-            </div>
-          </form>
-        </div>
-      </main>
-    </div>
+              <div className="flex items-center justify-between">
+                <button
+                  type="button"
+                  onClick={() => navigate('/questions')}
+                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
+                >
+                  Cancel
+                </button>
+                <button
+                  type="submit"
+                  disabled={!title.trim() || !content.trim() || loading}
+                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200"
+                >
+                  {loading ? 'Posting...' : 'Post Question'}
+                </button>
+              </div>
+            </form>
+          </div>
+        </main>
+      </div>
+    </ProtectedRoute>
   );
 };
 
 export default AskQuestion;