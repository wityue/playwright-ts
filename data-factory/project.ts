import { Data } from "dataclass";
 
/**
 * 项目信息类
 * @property {string} 项目名称 - 项目名称，默认值为 "ProjectA"
 * @property {string} 项目编码 - 项目编码
 * @property {string} [项目类型] - 项目类型
 */
export class Project extends Data {
    项目名称 = "ProjectA";
    项目编码: string;
    项目类型?: string;
}