import { ref, toValue, onMounted, onBeforeUnmount, type Ref, type MaybeRef } from 'vue';

/**
 * Detects whether a sticky element is currently stuck (fixed at its `top` offset)
 * or in its natural DOM position.
 *
 * A 1px invisible sentinel element is inserted immediately before the sticky element.
 * When that sentinel scrolls out of the IntersectionObserver's root viewport (adjusted
 * by `topOffset`), the element is considered stuck.
 *
 * `topOffset` must match the element's CSS `top` value in pixels. It is read once at
 * mount time. Pass a `Ref<number>` if the value is computed asynchronously (e.g. from
 * a CSS variable set by JavaScript after first render).
 */
export function useSticky(elementRef: Ref<HTMLElement | null>, topOffset: MaybeRef<number> = 0) {
    const isStuck = ref(false);
    let sentinel: HTMLElement | null = null;
    let observer: IntersectionObserver | null = null;

    onMounted(() => {
        const el = elementRef.value;
        if (!el) {
            return;
        }

        const offset = toValue(topOffset);

        sentinel = document.createElement('div');
        sentinel.style.cssText = 'height:1px;pointer-events:none;';
        el.parentNode!.insertBefore(sentinel, el);

        observer = new IntersectionObserver(
            ([entry]) => { isStuck.value = !entry.isIntersecting; },
            { rootMargin: `-${offset}px 0px 0px 0px` }
        );
        observer.observe(sentinel);
    });

    onBeforeUnmount(() => {
        observer?.disconnect();
        sentinel?.remove();
    });

    return { isStuck };
}
