import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PostCard } from './components/PostCard';
import { PostModal } from './components/PostModal';
import { NewPostModal } from './components/NewPostModal';
import type { Post, SiteStats } from './types';
import { fetchPosts, fetchStats, fetchPostDetail } from './api';
import { Plus, Heart } from 'lucide-react';

export function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);

  // Load stats once on mount
  useEffect(() => {
    fetchStats()
      .then((data) => setStats(data))
      .catch((err) => console.error('Error stats:', err));
  }, []);

  // Load posts whenever category or search query changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchPosts(selectedCategory, searchQuery)
      .then((data) => {
        if (isMounted) setPosts(data);
      })
      .catch((err) => console.error('Error posts:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, searchQuery]);

  // Open post and fetch details (increments views)
  const handleOpenPost = async (post: Post) => {
    setActivePost(post);
    try {
      const detailed = await fetchPostDetail(post.id);
      setActivePost(detailed);
      // update post views in list
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, views_count: detailed.views_count } : p))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
    if (stats) {
      setStats({ ...stats, total_posts: stats.total_posts + 1 });
    }
  };

  const handlePostUpdated = (updated: Post) => {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (activePost?.id === updated.id) {
      setActivePost(updated);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#4A3E3D] flex flex-col font-sans">
      {/* Navigation */}
      <Navbar
        stats={stats}
        onOpenNewPost={() => setIsNewPostOpen(true)}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Hero Header */}
      <Hero
        stats={stats}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Feed */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Category Pills Navigation (Mobile/Desktop) */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {['Todos', 'Reflexiones', 'Cafecito & Planes', 'Papelería & Apuntes', 'Momentos & Fotos'].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all shadow-2xs ${
                  selectedCategory === cat
                    ? 'bg-[#8C3A48] text-white shadow-sm'
                    : 'bg-[#FFFDF9] text-[#73605D] border border-[#EADBCE] hover:bg-[#FCEBED]'
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-[#FFFDF9] rounded-3xl border border-[#EFE5DC] overflow-hidden p-4 space-y-4 animate-pulse"
              >
                <div className="aspect-[16/10] bg-[#EFE5DC] rounded-2xl" />
                <div className="h-5 bg-[#EFE5DC] rounded w-3/4" />
                <div className="h-4 bg-[#EFE5DC] rounded w-full" />
                <div className="h-4 bg-[#EFE5DC] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 bg-[#FFFDF9] rounded-3xl border border-dashed border-[#E3D6CD] p-8 max-w-md mx-auto">
            <span className="text-4xl block mb-3">🌸</span>
            <h3 className="font-serif text-xl font-bold text-[#3A2D2D] mb-2">
              No hay publicaciones aún
            </h3>
            <p className="text-sm text-[#877572] mb-5">
              {searchQuery
                ? `No encontramos resultados para "${searchQuery}".`
                : 'Sé la primera en escribir una historia con fotos y videos.'}
            </p>
            <button
              onClick={() => setIsNewPostOpen(true)}
              className="inline-flex items-center space-x-2 bg-[#D88D96] text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-xs hover:bg-[#C97A88]"
            >
              <Plus className="w-4 h-4" />
              <span>Publicar algo nuevo</span>
            </button>
          </div>
        ) : (
          /* Grid of Posts */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onClick={() => handleOpenPost(post)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button (Mobile) */}
      <div className="fixed bottom-6 right-6 sm:hidden z-30">
        <button
          onClick={() => setIsNewPostOpen(true)}
          className="w-13 h-13 rounded-full bg-[#D88D96] text-white shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Modals */}
      <PostModal
        post={activePost}
        onClose={() => setActivePost(null)}
        onPostUpdated={handlePostUpdated}
      />

      <NewPostModal
        isOpen={isNewPostOpen}
        onClose={() => setIsNewPostOpen(false)}
        onPostCreated={handlePostCreated}
      />

      {/* Footer */}
      <footer className="bg-[#FFFDF9] border-t border-[#EFE5DC] py-10 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-3">
          <div className="flex items-center justify-center space-x-1.5 text-sm font-serif font-bold text-[#3A2D2D]">
            <span>Bibi</span>
            <span className="text-xs">🥰</span>
            <span>• Momentos, Café & Vida Bonita</span>
          </div>
          <p className="text-xs text-[#8F7D7A] flex items-center justify-center space-x-1">
            <span>Hecho con</span>
            <Heart className="w-3.5 h-3.5 fill-[#C93B52] text-[#C93B52]" />
            <span>para compartir inspiración todos los días</span>
          </p>
          <p className="text-[11px] text-[#A69794]">
            © {new Date().getFullYear()} María Bibiana Remolina. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
export default App;
