export function createLazyLoader(options) {
    const {
        sentinel,           // Elemento trigger para lazy load
        fetcher,            // async (offset) => {items, hasMore, total}
        renderer,           // (items) => void (agrega items a tabla)
        onError,            // (error) => void
        threshold = 0.5,
        maxRetries = 3
    } = options;

    let state = {
        offset: 0,
        isLoading: false,
        hasMore: true,
        retries: 0,
        total: 0
    };

    const observer = new IntersectionObserver(async (entries) => {
        if (!entries[0].isIntersecting || state.isLoading || !state.hasMore) return;

        state.isLoading = true;

        try {
            const { items, hasMore, total } = await fetcher(state.offset);

            if (items.length > 0) {
                renderer(items);
                state.offset += items.length;
                state.hasMore = hasMore;
                state.total = total;
                state.retries = 0;
            }
        } catch (error) {
            console.error('Error en lazy load:', error);
            state.retries++;

            if (state.retries >= maxRetries) {
                state.hasMore = false;
                if (onError) onError(error);
            }
        } finally {
            state.isLoading = false;
        }
    }, { threshold });

    observer.observe(sentinel);

    return {
        reset: () => {
            state = {
                offset: 0,
                isLoading: false,
                hasMore: true,
                retries: 0,
                total: 0
            };
        },
        stop: () => observer.disconnect(),
        getState: () => ({ ...state })
    };
}
