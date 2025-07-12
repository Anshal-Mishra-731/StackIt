@@ .. @@
 import React from 'react';
 import Navbar from '../components/Navbar';
 import Sidebar from '../components/Sidebar';
+import ProtectedRoute from '../components/ProtectedRoute';
 
 const Articles = () => {
   return (
-    <div className="min-h-screen bg-gray-50">
-      <Navbar />
-      <Sidebar />
-      
-      <main className="ml-64 pt-20 p-8">
-        <div className="max-w-4xl mx-auto">
-          <h1 className="text-3xl font-bold text-gray-900 mb-8">Articles</h1>
-          <p className="text-gray-600 text-lg">Discover in-depth articles and tutorials from the community.</p>
-        </div>
-      </main>
-    </div>
+    <ProtectedRoute>
+      <div className="min-h-screen bg-gray-50">
+        <Navbar />
+        <Sidebar />
+        
+        <main className="ml-64 pt-20 p-8">
+          <div className="max-w-4xl mx-auto">
+            <h1 className="text-3xl font-bold text-gray-900 mb-8">Articles</h1>
+            <p className="text-gray-600 text-lg">Discover in-depth articles and tutorials from the community.</p>
+          </div>
+        </main>
+      </div>
+    </ProtectedRoute>
   );
 };
 
 export default Articles;