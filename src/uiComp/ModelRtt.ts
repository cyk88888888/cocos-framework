import { _decorator, Camera, CCBoolean, CCFloat, CCString, Color, Component, error, EventTouch, find, instantiate, Node, NodeEventType, Prefab, renderer, RenderTexture, Sprite, SpriteFrame, UITransform, Vec3 } from 'cc';
import { ResMgr } from '../mgr/ResMgr';
const { ccclass, property } = _decorator;

@ccclass('ModelRtt')
export class ModelRtt extends Component {

    @property({ tooltip: '模型预制体路径', type: CCString})
    modelUrl: string = "";
    @property({ tooltip: '模型的偏移, 用于调整模型显示的位置(单位: 米)', type: CCFloat})
    modelOffsetY: number = 0;
    @property({ tooltip: '相机的正交视角高度, 用于调整模型的大小(值越大, 模型越小)', type: CCFloat})
    orthoHeight: number = 0;
    @property({ tooltip: '显示3d模型的渲染纹理目标精灵'})
    modelSprite: Sprite = null;
    @property({ tooltip: '是否禁用点击, 禁用时不可触摸旋转模型', type: CCBoolean})
    forbidTouch: boolean = false;

    private _modelNode: Node;
    start() {
        this.modelSprite = this.getComponent(Sprite);
        this.loadPrefab();
    }

    private async loadPrefab() {
        if (!this.modelUrl || !this.modelSprite) {
            error('Please provide a valid prefab path and target sprite.');
            return;
        }

        let prefab = await ResMgr.inst.loadPrefab(this.modelUrl);
        if(this.node.isValid){
            this.createModel(prefab);
        }
    }

    private createModel(prefab: Prefab) {
        const size = this.node.getComponent(UITransform).contentSize;
        const modelRtt = new RenderTexture();
        modelRtt.reset({
            width: size.width,
            height: size.height
        });

        const newNode = this._modelNode = new Node();
        newNode.parent = find("/");
        const modelNode: Node = instantiate(prefab);
        modelNode.parent = newNode;
        modelNode.setPosition(new Vec3(0, this.modelOffsetY, 0));

        if(!this.forbidTouch){
            let flag = false;
            this.node.on(NodeEventType.TOUCH_START, () => { flag = true; }, this);
            this.node.on(NodeEventType.TOUCH_END, () => { flag = true; }, this);
            this.node.on(NodeEventType.TOUCH_MOVE, (event: EventTouch) => {
                if (flag) {
                    modelNode.eulerAngles = new Vec3(0, modelNode.eulerAngles.y + event.getDeltaX(), 0);
                }
            }, this);
        }

        // const camera = new Node("Camera").addComponent(Camera); //todo：动态添加的Camera模型不会动 
        const camera = this.node.getComponentInChildren(Camera);
        camera.clearFlags = Camera.ClearFlag.SOLID_COLOR;
        camera.projection = renderer.scene.CameraProjection.ORTHO;
        camera.orthoHeight = this.orthoHeight;
        camera.clearColor = new Color(0, 0, 0, 0);
        camera.targetTexture = modelRtt;
        camera.node.parent = newNode;
        camera.node.position = new Vec3(0, 0, 10);

        const spriteFrame = new SpriteFrame();
        spriteFrame.texture = modelRtt;
        spriteFrame.flipUVY = true;
        this.modelSprite.spriteFrame = spriteFrame;
    }

    protected onDestroy(): void {
        if(this._modelNode) this._modelNode.destroy();
    }
}


