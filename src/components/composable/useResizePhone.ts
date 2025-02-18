import debounce from '../../helper/debounceHelper';
import {computed, onBeforeUnmount, onMounted, Ref, ref} from 'vue';
export const useResizePhone = ()=>{
	const windowWidth = ref(0);
  const debounceResizeEvent : Ref<undefined|((...args: any[]) => void)> =ref(undefined);

  const isPhone = computed(() => windowWidth.value < 960);

  function handleResize() {
    windowWidth.value = window.innerWidth;
  }
  onMounted(() => {
    debounceResizeEvent.value = debounce(handleResize, 500);
    window.addEventListener('resize', debounceResizeEvent.value);
    handleResize();
  })
  
  onBeforeUnmount(() => {
    window.removeEventListener('resize', debounceResizeEvent.value);
  })

	return {
    isPhone,
		windowWidth,
	}
}

