import './styles.css';

document.addEventListener('DOMContentLoaded', () => {
    const emojiContainer = document.getElementById('emoji-container');
    const favoritesContainer = document.getElementById('favorites-container');
    const categorySelect = document.getElementById('category-select');
    const copyMessage = document.getElementById('copy-message');

    const emojiData = {
        all: { name: "All", ranges: [] },
        emoticons: { name: "Emoticons", ranges: [[0x1F600, 0x1F64F]] },
        miscSymbolsPictographs: { name: "Miscellaneous Symbols and Pictographs", ranges: [[0x1F300, 0x1F5FF]] },
        transport: { name: "Transport and Map Symbols", ranges: [[0x1F680, 0x1F6FF]] },
        alchemical: { name: "Alchemical Symbols", ranges: [[0x1F700, 0x1F77F]] },
        geometricShapes: { name: "Geometric Shapes Extended", ranges: [[0x1F780, 0x1F7FF]] },
        supplementalArrows: { name: "Supplemental Arrows-C", ranges: [[0x1F800, 0x1F8FF]] },
        supplementalSymbols: { name: "Supplemental Symbols and Pictographs", ranges: [[0x1F900, 0x1F9FF]] },
        chessSymbols: { name: "Chess Symbols", ranges: [[0x1FA00, 0x1FA6F]] },
        symbolsExtended: { name: "Symbols and Pictographs Extended-A", ranges: [[0x1FA70, 0x1FAFF]] },
        miscSymbols: { name: "Miscellaneous Symbols", ranges: [[0x2600, 0x26FF]] },
        dingbats: { name: "Dingbats", ranges: [[0x2700, 0x27BF]] },
        flags: { name: "Flags", ranges: [[0x1F1E6, 0x1F1FF]] },
        technical: { name: "Miscellaneous Technical", ranges: [[0x2300, 0x23FF]] },
        symbolsArrows: { name: "Miscellaneous Symbols and Arrows", ranges: [[0x2B50, 0x2BFF]] },
        mahjong: { name: "Mahjong and Playing Cards", ranges: [[0x1F004, 0x1F0CF]] }
    };

    // Add all ranges to the "all" category
    for (let category in emojiData) {
        if (category !== 'all') {
            emojiData.all.ranges = emojiData.all.ranges.concat(emojiData[category].ranges);
        }
    }

    function populateCategorySelect() {
        for (const category in emojiData) {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = emojiData[category].name;
            categorySelect.appendChild(option);
        }
    }

    function getEmojis(ranges) {
        let emojis = [];
        ranges.forEach(range => {
            for (let codePoint = range[0]; range[1] && codePoint <= range[1]; codePoint++) {
                emojis.push(String.fromCodePoint(codePoint));
            }
        });
        return emojis;
    }

    function displayEmojis(emojis, container, showCategories = false) {
        container.innerHTML = '';
        if (showCategories) {
            for (const category in emojiData) {
                if (category === 'all') continue;
                const categoryEmojis = getEmojis(emojiData[category].ranges);
                const categoryHeader = document.createElement('h2');
                categoryHeader.textContent = emojiData[category].name;
                container.appendChild(categoryHeader);
                categoryEmojis.forEach(emoji => {
                    const span = document.createElement('span');
                    span.className = 'emoji';
                    span.innerText = emoji;
                    span.onclick = (event) => copyEmoji(event, emoji);
                    addHeartIcon(span, emoji);
                    container.appendChild(span);
                });
            }
        } else {
            emojis.forEach(emoji => {
                const span = document.createElement('span');
                span.className = 'emoji';
                span.innerText = emoji;
                span.onclick = (event) => copyEmoji(event, emoji);
                addHeartIcon(span, emoji);
                container.appendChild(span);
            });
        }
    }

    function copyEmoji(event, emoji) {
        navigator.clipboard.writeText(emoji).then(() => {
            showCopyMessage(event.target);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }

    function showCopyMessage(target) {
        const rect = target.getBoundingClientRect();
        const x = rect.left + (rect.width / 2);
        const y = rect.top - 10; // Offset above the emoji
        copyMessage.style.top = `${y}px`;
        copyMessage.style.left = `${x}px`;
        copyMessage.classList.remove('hidden');
        setTimeout(() => {
            copyMessage.classList.add('hidden');
        }, 1500);
    }

    function addHeartIcon(span, emoji) {
        const heartIcon = document.createElement('span');
        heartIcon.className = 'heart-icon';
        heartIcon.innerHTML = '❤'; // Unicode heart symbol
        if (isFavorite(emoji)) {
            heartIcon.classList.add('favorited');
        }
        heartIcon.onclick = (event) => toggleFavorite(event, emoji);
        span.appendChild(heartIcon);
    }

    function toggleFavorite(event, emoji) {
        event.stopPropagation(); // Prevent copying emoji when clicking the heart
        const heartIcon = event.target;
        heartIcon.classList.toggle('favorited');
        if (heartIcon.classList.contains('favorited')) {
            addFavorite(emoji);
        } else {
            removeFavorite(emoji);
            updateOriginalHeartIcon(emoji, false);
        }
        saveFavorites();
    }

    function addFavorite(emoji) {
        if (!isFavorite(emoji)) {
            const span = document.createElement('span');
            span.className = 'emoji';
            span.innerText = emoji;
            span.onclick = (event) => copyEmoji(event, emoji);
            const heartIcon = document.createElement('span');
            heartIcon.className = 'heart-icon favorited'; // Add favorited class here
            heartIcon.innerHTML = '❤'; // Unicode heart symbol
            heartIcon.onclick = (event) => {
                toggleFavorite(event, emoji);
                span.remove(); // Remove the emoji from favorites on click
            };
            span.appendChild(heartIcon);
            favoritesContainer.appendChild(span);
            updateOriginalHeartIcon(emoji, true);
        }
    }

    function removeFavorite(emoji) {
        const favoriteEmojis = favoritesContainer.querySelectorAll('.emoji');
        favoriteEmojis.forEach(favEmoji => {
            if (favEmoji.innerText === emoji) {
                favoritesContainer.removeChild(favEmoji);
            }
        });
        saveFavorites();
    }

    function isFavorite(emoji) {
        const favoriteEmojis = favoritesContainer.querySelectorAll('.emoji');
        for (let favEmoji of favoriteEmojis) {
            if (favEmoji.innerText === emoji) {
                return true;
            }
        }
        return false;
    }

    function updateOriginalHeartIcon(emoji, isFavorited) {
        const originalEmojis = emojiContainer.querySelectorAll('.emoji');
        originalEmojis.forEach(origEmoji => {
            if (origEmoji.innerText === emoji) {
                const heartIcon = origEmoji.querySelector('.heart-icon');
                if (isFavorited) {
                    heartIcon.classList.add('favorited');
                } else {
                    heartIcon.classList.remove('favorited');
                }
            }
        });
    }

    function saveFavorites() {
        const favoriteEmojis = Array.from(favoritesContainer.querySelectorAll('.emoji')).map(span => span.innerText);
        localStorage.setItem('favoriteEmojis', JSON.stringify(favoriteEmojis));
    }

    function loadFavorites() {
        const favoriteEmojis = JSON.parse(localStorage.getItem('favoriteEmojis')) || [];
        favoriteEmojis.forEach(emoji => addFavorite(emoji));
    }

    categorySelect.addEventListener('change', (e) => {
        const category = e.target.value;
        if (category === 'all') {
            displayEmojis(getEmojis(emojiData[category].ranges), emojiContainer, true);
        } else {
            displayEmojis(getEmojis(emojiData[category].ranges), emojiContainer);
        }
    });

    populateCategorySelect();
    displayEmojis(getEmojis(emojiData.all.ranges), emojiContainer, true); // Display all emojis with categories by default
    loadFavorites(); // Load favorites from localStorage
});
