(() => {
    console.log("Twitter Bookmark Script Initialized");

    // More precise selector for bookmark buttons
    const findBookmarkButtons = () => {
        // Multiple selectors to increase chances of finding bookmark buttons
        const selectors = [
            '[data-testid="bookmark"]', 
            'div[role="button"][aria-label*="Bookmark"]',
            'div[aria-label*="Bookmark"]'
        ];

        let bookmarkButtons = [];
        for (const selector of selectors) {
            bookmarkButtons = [...document.querySelectorAll(selector)];
            if (bookmarkButtons.length > 0) break;
        }

        return bookmarkButtons;
    };

    // Function to extract tweet ID
    const extractTweetId = (bookmarkButton) => {
        try {
            // Traverse up to find the closest tweet container
            const tweetContainer = bookmarkButton.closest('article');
            
            if (!tweetContainer) return null;

            // Multiple methods to extract tweet ID
            // 1. Look for tweet link with status
            const tweetLink = tweetContainer.querySelector('a[href*="/status/"]');
            if (tweetLink) {
                const url = new URL(tweetLink.href);
                const pathParts = url.pathname.split('/');
                const statusIndex = pathParts.indexOf('status');
                if (statusIndex !== -1 && pathParts[statusIndex + 1]) {
                    return pathParts[statusIndex + 1];
                }
            }

            // 2. Check for data attributes
            const dataTweetId = tweetContainer.getAttribute('data-tweet-id');
            if (dataTweetId) return dataTweetId;

            return null;
        } catch (error) {
            console.error('Tweet ID extraction error:', error);
            return null;
        }
    };

    // Main observation function
    const observeBookmarkButtons = () => {
        const bookmarkButtons = findBookmarkButtons();

        bookmarkButtons.forEach(button => {
            // Prevent multiple listeners
            if (button.getAttribute('data-bookmark-listener')) return;
            button.setAttribute('data-bookmark-listener', 'true');

            button.addEventListener('click', (event) => {
                const tweetId = extractTweetId(button);

                if (tweetId) {
                    console.log("Bookmarked Tweet ID:", tweetId);

                    try {
                        const bookmarkedTweets = JSON.parse(localStorage.getItem('bookmarkedTweets') || '[]');
                        if (!bookmarkedTweets.includes(tweetId)) {
                            bookmarkedTweets.push(tweetId);
                            localStorage.setItem('bookmarkedTweets', JSON.stringify(bookmarkedTweets));
                        }
                    } catch (error) {
                        console.error('Bookmarking error:', error);
                    }
                } else {
                    console.warn('Could not extract tweet ID');
                }
            });
        });
    };

    // Initial run
    observeBookmarkButtons();

    // Continuous observation for dynamically loaded content
    const observer = new MutationObserver(() => {
        observeBookmarkButtons();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();