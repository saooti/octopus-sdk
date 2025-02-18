export const useTagOf = ()=>{

  function isOuestFranceTag(tag: string): boolean {
    return "[of]" === tag.substring(0, 4);
  }
  function formateOfTag(tag: string): string {
    if (!isOuestFranceTag(tag)) {
      return tag;
    }
    const lastSlash = tag.lastIndexOf("/");
    if (-1 !== lastSlash) {
      return tag.substring(lastSlash + 1, tag.length);
    }
    return tag.substring(4, tag.length);
  }
  
	return {
    isOuestFranceTag,
    formateOfTag
	}
}
