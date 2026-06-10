import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue';

/**
 * Detects whether a sticky element is currently stuck (fixed at its `top` offset)
 * or in its natural DOM position.
 *
 * A 1px invisible sentinel element is inserted immediately before the sticky element.
 * When that sentinel scrolls out of the IntersectionObserver's root viewport (adjusted
 * by the element's computed `top` offset), the element is considered stuck.
 */
export function useSticky(elementRef: Ref<HTMLElement | null>) {
    const isStuck = ref(false);
    let sentinel: HTMLElement | null = null;
    let observer: IntersectionObserver | null = null;

    onMounted(() => {
        const el = elementRef.value;
        if (!el) {
            return;
        }

        const topOffset = parseInt(getComputedStyle(el).top) || 0;

        sentinel = document.createElement('div');
        sentinel.style.cssText = 'height:1px;pointer-events:none;';
        el.parentNode!.insertBefore(sentinel, el);

        observer = new IntersectionObserver(
            ([entry]) => { isStuck.value = !entry.isIntersecting; },
            { rootMargin: `-${topOffset}px 0px 0px 0px` }
        );
        observer.observe(sentinel);
    });

    onBeforeUnmount(() => {
        observer?.disconnect();
        sentinel?.remove();
    });

    return { isStuck };
}
