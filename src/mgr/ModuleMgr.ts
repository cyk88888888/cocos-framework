import { js } from "cc";
import { ModuleCfgInfo } from "../base/ModuleCfgInfo";
import { UIScene } from "../ui/UIScene";
/** 
 * @descripttion 页面模块管理器
 * @author cyk
 * @date 2022-05-23 09:27:58
 */
export class ModuleMgr {
    private static _inst: ModuleMgr;
    public static get inst() {
        if (!this._inst) {
            this._inst = new ModuleMgr();
        }
        return this._inst;
    }
}
export let moduleInfoMap: { [sceneName: string]: ModuleCfgInfo } = {};
/**
 * 注册场景模块
 * @param sceneName 场景名称
 * @param resList 预加载资源列表
 * @param cacheEnabled 是否开启缓存模式
 */
export function registerModule(targetClass: typeof UIScene, preResList: string[], cacheEnabled?: boolean) {
    let moduleCfgInfo = new ModuleCfgInfo();
    moduleCfgInfo.targetClass = targetClass;
    moduleCfgInfo.name = js.getClassName(targetClass);;
    moduleCfgInfo.cacheEnabled = cacheEnabled;
    moduleCfgInfo.preResList = preResList;
    moduleInfoMap[moduleCfgInfo.name] = moduleCfgInfo;
}
