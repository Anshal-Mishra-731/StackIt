@@ .. @@
 import React from 'react';
 import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
+import { AuthProvider } from './context/AuthContext';
 import Home from './pages/Home';
 import Questions from './pages/Questions';
 import QuestionDetail from './pages/QuestionDetail';
@@ -14,15 +15,17 @@ import Articles from './pages/Articles';
 
 function App() {
   return (
-    <Router>
-      <div className="App">
-        <Routes>
-          <Route path="/" element={<Home />} />
-          <Route path="/questions" element={<Questions />} />
-          <Route path="/question/:id" element={<QuestionDetail />} />
-          <Route path="/ask" element={<AskQuestion />} />
-          <Route path="/communities" element={<Communities />} />
-          <Route path="/articles" element={<Articles />} />
-        </Routes>
-      </div>
-    </Router>
+    <AuthProvider>
+      <Router>
+        <div className="App">
+          <Routes>
+            <Route path="/" element={<Home />} />
+            <Route path="/questions" element={<Questions />} />
+            <Route path="/question/:id" element={<QuestionDetail />} />
+            <Route path="/ask" element={<AskQuestion />} />
+            <Route path="/communities" element={<Communities />} />
+            <Route path="/articles" element={<Articles />} />
+          </Routes>
+        </div>
+      </Router>
+    </AuthProvider>
   );
 }
 
 export default App;