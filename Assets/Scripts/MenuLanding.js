#pragma strict

import Holoville.HOTween.Plugins;
import Holoville.HOTween;

var main:Global;
var titleTM:tk2dTextMesh;
var startBtnTM:tk2dTextMesh;

function Start () {
}


function OnNewGameClicked() {
	StopAnim("in");
	PlayAnim("out");
	yield WaitForSeconds(2.0+0.5);
	main.SetStat("newgame");
}
function WillSetStat(s:String, olds:String){

}
function AfterSetStat(s:String, olds:String){
	if(s=="reset"){
		titleTM.color=new Color(0,0,0,0);
		startBtnTM.color=new Color(0,0,0,0);
	}
}

private var outgameseq:Sequence;
private var inlandingseq:Sequence;
function PlayAnim(s:String){
	var anim:Animation=this.GetComponent(Animation);
	if(s=="in"){
		if(inlandingseq==null){
			var delay:float=1;
			inlandingseq=new Sequence();
			inlandingseq.autoKillOnComplete=false;
			inlandingseq.Insert(delay+0.6, HOTween.To(titleTM, 						1.5, new TweenParms().Prop("color", new Color(1,1,1,1)).Ease(EaseType.EaseInOutCubic)));
			inlandingseq.Insert(delay+1.8, HOTween.To(startBtnTM, 					1.0, new TweenParms().Prop("color", new Color(1,1,1,1)).Ease(EaseType.EaseInOutCubic)));
		}
		HOTween.To(startBtnTM, 					0.8, new TweenParms().Prop("color", new Color(0,0,0,0)).Ease(EaseType.EaseInOutSine).Loops(-1, LoopType.Yoyo).Delay(delay+2.9).Id("inlanding"));
		var subseq:Sequence=Global.createRandomTweenRectangleVector3(main.gameCamera.transform, "localPosition", main.gameCamera.transform.localPosition, [new Vector3(-60,-30,0), new Vector3(60,30,0)], [3.0,5.0], [10.0,10.0], 20);
		subseq.id="inlanding";
		subseq.Play();
		
		//subseq=Global.createRandomTweenRotation(main.gameCamera.transform, "localRotation", main.gameCamera.transform.localRotation, [Quaternion.Euler(0,0,-2),Quaternion.Euler(0,0,2)], [4.0,7.0], [10.0,10.0], 20);
		//subseq.id="inlanding";
		//subseq.Play();
		
		inlandingseq.Play();
	}else if(s=="out"){
		if(outgameseq==null){
			outgameseq=new Sequence();
			outgameseq.Insert(0.1, HOTween.To(titleTM, 						0.4, new TweenParms().Prop("color", new Color(0,0,0,0)).Ease(EaseType.EaseInOutCubic)));
			outgameseq.Insert(0.3, HOTween.To(startBtnTM, 					0.4, new TweenParms().Prop("color", new Color(0,0,0,0)).Ease(EaseType.EaseInOutCubic)));
			outgameseq.Insert(0.5, HOTween.To(main.gameCamera.transform, 	2.0, new TweenParms().Prop("localPosition", new Vector3(0,0,main.gameCamera.transform.localPosition.z)).Ease(EaseType.EaseInOutCubic)));
			outgameseq.Insert(0.5, HOTween.To(main.gameCamera.transform, 	2.0, new TweenParms().Prop("localRotation", Quaternion.identity).Ease(EaseType.EaseInOutCubic)));
		}
		outgameseq.Play();
	}
}
function StopAnim(s:String){
	if(s=="in"){if(inlandingseq) inlandingseq.Kill(); HOTween.Kill("inlanding");}
	else if(s=="out")if(outgameseq) outgameseq.Kill();
}




#if UNITY_EDITOR
function Update () {
	if(Input.GetKeyDown(KeyCode.A)){
		HOTween.To(titleTM, 2, new TweenParms().Prop("color", new Color(1,1,1,0)));
	}else if(Input.GetKeyDown(KeyCode.S)){
		HOTween.To(titleTM.transform.localPosition, 2, new TweenParms().Prop("x", 0));
	}else if(Input.GetKeyDown(KeyCode.E)){
		HOTween.To(titleTM, 2, new TweenParms().Prop("color", new Color(0,0,0,-1), true));
		HOTween.To(titleTM, 2, new TweenParms().Prop("color", new Color(0,0,0,0.5), true).Delay(2));
	}else if(Input.GetKeyDown(KeyCode.R)){
		HOTween.To(titleTM, 2, new TweenParms().Prop("color", new Color(0,0,0,1), true));
		HOTween.To(titleTM, 2, new TweenParms().Prop("color", new Color(0,0,0,-0.5), true).Delay(2));
	}else if(Input.GetKeyDown(KeyCode.Z)){
		HOTween.To(titleTM, 2, new TweenParms().Prop("color.a", 0));
	}else if(Input.GetKeyDown(KeyCode.X)){
		HOTween.To(titleTM, 2, new TweenParms().Prop("color.a", 1));
	}else if(Input.GetKeyDown(KeyCode.Q)){
		HOTween.To(titleTM.color, 2, new TweenParms().Prop("a", 0));
	}else if(Input.GetKeyDown(KeyCode.W)){
		HOTween.To(titleTM.color, 2, new TweenParms().Prop("a", 1));
		
		
	}else if(Input.GetKeyDown(KeyCode.Q)){
		HOTween.To(titleTM.transform.localPosition, 2, new TweenParms().Prop("x", 300));
	}else if(Input.GetKeyDown(KeyCode.W)){
		HOTween.To(titleTM.transform.localPosition, 2, new TweenParms().Prop("x", 0));
	}
}
#endif

