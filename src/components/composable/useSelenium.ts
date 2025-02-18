export const useSelenium = ()=>{

  function seleniumFormat(string: string): string {
    return string.toLowerCase().replace(/\s/g, "");
  }
  
	return {
    seleniumFormat
	}
}
