export interface FtpParam {
  secureFile?: string;
  domain: string;
  ftpProtocol: string;
  id: number;
  login: string;
  organisationId: string;
  port: number;
  version: number;
  name: string;
  delay: number;
}
export function emptyFtpParam(): FtpParam {
  return {
    domain: "",
    ftpProtocol: "",
    id: -1,
    login: "",
    organisationId: "",
    port: 0,
    version: 0,
    name: "",
    delay: 0,
  };
}
