document.addEventListener('DOMContentLoaded', async () => {
    const postsContainer = document.getElementById('posts-grid');
    const featuredPostContainer = document.getElementById('featured-post');
    const searchInput = document.getElementById('blog-search');
    const categoryButtons = document.querySelectorAll('.cat-btn');

    let allPosts = [];

    // Fetch posts from JSON
    try {
        const response = await fetch('data/posts.json');
        allPosts = await response.json();
        renderBlog(allPosts);
    } catch (error) {
        console.error('Error loading blog posts:', error);
        if (postsContainer) {
            postsContainer.innerHTML = '<p class="error-msg">Failed to load blog posts. Please try again later.</p>';
        }
    }

    // Function to render the blog listing
    function renderBlog(posts) {
        if (!postsContainer) return;

        const isHomePage = document.querySelector('.home-blog');

        // Render Featured Post (only on blog page, never on homepage)
        if (featuredPostContainer && posts.length > 0 && !isHomePage) {
            const featured = posts[0];
            featuredPostContainer.innerHTML = `
                <div class="featured-card" onclick="location.href='blog-post.html?id=${featured.id}'">
                    <div class="featured-image">
                        <img src="${featured.image}" alt="${featured.title}">
                    </div>
                    <div class="featured-content">
                        <span class="category-tag">${featured.category}</span>
                        <h2>${featured.title}</h2>
                        <p>${featured.excerpt}</p>
                        <div class="post-meta">
                            <span>${featured.author}</span>
                            <span>•</span>
                            <span>${featured.date}</span>
                        </div>
                    </div>
                </div>
            `;
        }

        // Render Grid
        // If it's the blog page, skip the first post (since it's featured)
        // If it's the home page, show the first 3 posts
        let gridPosts;
        if (isHomePage) {
            gridPosts = posts.slice(0, 3);
        } else {
            gridPosts = posts.length > 1 ? posts.slice(1) : posts;
        }

        postsContainer.innerHTML = gridPosts.map(post => `
            <article class="post-card" onclick="location.href='blog-post.html?id=${post.id}'">
                <div class="post-image">
                    <img src="${post.image}" alt="${post.title}">
                </div>
                <div class="post-info">
                    <span class="category-tag">${post.category}</span>
                    <h3>${post.title}</h3>
                    <p>${post.excerpt}</p>
                    <div class="post-meta">
                        <span>${post.date}</span>
                        <span>${post.readTime}</span>
                    </div>
                </div>
            </article>
        `).join('');
    }

    // Individual Post Logic
    const postDetailContainer = document.getElementById('post-detail');
    if (postDetailContainer) {
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');

        if (postId) {
            try {
                const response = await fetch('data/posts.json');
                const posts = await response.json();
                const post = posts.find(p => p.id === postId);

                if (post) {
                    renderPostDetail(post, posts);
                } else {
                    postDetailContainer.innerHTML = '<h2>Post not found</h2>';
                }
            } catch (err) {
                console.error(err);
            }
        }
    }

    function renderPostDetail(post, allPosts) {
        document.title = `${post.title} | Muonde Tech Blog`;
        
        postDetailContainer.innerHTML = `
            <div class="post-header">
                <span class="category-tag">${post.category}</span>
                <h1>${post.title}</h1>
                <div class="post-meta-large">
                    <div class="author-info">
                        <strong>${post.author}</strong>
                        <span>Published on ${post.date} • ${post.readTime}</span>
                    </div>
                </div>
            </div>
            <div class="post-hero-image">
                <img src="${post.image}" alt="${post.title}">
            </div>
            <div class="post-body">
                ${post.content.split('\n\n').map(p => `<p>${p}</p>`).join('')}
            </div>
            <div class="related-posts">
                <h2>Related Stories</h2>
                <div class="posts-grid">
                    ${allPosts.filter(p => p.id !== post.id).slice(0, 2).map(p => `
                        <article class="post-card" onclick="location.href='blog-post.html?id=${p.id}'">
                            <div class="post-image">
                                <img src="${p.image}" alt="${p.title}">
                            </div>
                            <div class="post-info">
                                <h3>${p.title}</h3>
                            </div>
                        </article>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Search and Filter
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = allPosts.filter(p => 
                p.title.toLowerCase().includes(term) || 
                p.excerpt.toLowerCase().includes(term)
            );
            renderBlog(filtered);
        });
    }

    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const cat = btn.dataset.category;
            
            if (cat === 'all') {
                renderBlog(allPosts);
            } else {
                const filtered = allPosts.filter(p => p.category === cat);
                renderBlog(filtered);
            }
        });
    });
});
