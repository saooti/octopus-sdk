export const isClient = typeof window !== 'undefined';
export const isServer = typeof window === 'undefined';
export const onClient = (callback: () => void) => {
  if (isClient) {
    callback()
  }
};
export const onServer = (callback: () => void) => {
  if (isServer) {
    callback()
  }
};
export const isMobile = isClient && window.matchMedia("(hover: none)").matches;
export const windowScrollY = () =>{
  if(isClient){
    return window.scrollY;
  }
  return 0;
}
export const defineTitle = (title: string) =>{
  if(isClient){
    document.title = title;
  }
}
export const pageUrl = () =>{
  if(isClient){
    return window.location.href;
  }
  return "/";
}