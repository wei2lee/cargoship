#pragma strict

import System.Text;

var shipControl:ShipControl2;
var main:Global;
var timeCountGUI:tk2dTextMesh;
var lifeGUI:tk2dTextMesh;
var pausebtn:tk2dUIItem;
var speedGUI:tk2dTextMesh;

var life:float;
var maxTimeCount:float=60;
var useIncreaseTimeCount:boolean=true;
var runTimeCount:boolean=false;
var timeCount:float;
var speed:float;


var runDistance:float;

var failedTimeCount:boolean=false;


private var player:Player;
private var sb:StringBuilder;

function OnDestroy() {
	StopAnim("all");
}

function SetSpeed(v:float):void{
	if(speed==Mathf.Round(v))return;
	speed=Mathf.Round(v);
	UpdateSpeed();
}
function UpdateSpeed(){
	sb.Length=0;
	var iv:int=Mathf.Round(speed);
	sb.Append("SPEED ");
	sb.Append(iv);
	speedGUI.text=sb.ToString();
}

function SetLife(v:float):void {
	if(life==Mathf.Round(v))return;
	life=Mathf.Round(v);
	UpdateLife();
	
	if(life==0){
		if(!main.gameSession.failedLife){
			main.gameSession.failedLife=true;
			PlayAnim("failedlife");
		}
	}
}
function UpdateLife(){
	sb.Length=0;
	var iv:int=Mathf.Round(life);
	sb.Append("LIFE ");
	sb.Append(iv);
	lifeGUI.text=sb.ToString();
}

private var sptr:String=":";
function SetTimeCount(v:float) {
	if(timeCount==Mathf.Clamp(v, 0, 99*60+59+0.99))return;
	timeCount=Mathf.Clamp(v, 0, 99*60+59+0.99);
	
	var ms:int=Mathf.Clamp(Mathf.Floor(timeCount*100)%100,0,99);
	var ss:int=Mathf.Clamp(Mathf.Floor(timeCount)%60,0,59);
	var mi:int=Mathf.Clamp(Mathf.Floor(timeCount/60)%100,0,99);
	
	sb.Length=0;
	
	if(mi<10)sb.Append(0);
	sb.Append(mi);
	sb.Append(sptr);
	if(ss<10)sb.Append(0);
	sb.Append(ss);
	sb.Append(sptr);
	if(ms<10)sb.Append(0);
	sb.Append(ms);
	
	timeCountGUI.text=sb.ToString();
	timeCountGUI.Commit();
	
	
	if(!useIncreaseTimeCount){
		if(timeCount==0){
			if(!main.gameSession.failedTimeCount){
				main.gameSession.failedTimeCount=true;
				PlayAnim("failedtimecount");
			}
		}
	}
}
private var failedtimecountseq:Sequence;
private var failedlifeseq:Sequence;
function PlayAnim(s:String):void {
	var anim:Animation=this.GetComponent(Animation);
	if(s=="in"){
		anim.Play("GameHUDInAnimation");
	}else if(s=="failedtimecount"){
		if(failedtimecountseq==null){
			//failedtimecountseq=new Sequence(new SequenceParms().Loops(-1));
			//failedtimecountseq.Insert(0.33, HOTween.To(timeCountGUI, 0.01, new TweenParms().Prop("color", new Color(0,0,0,0))));
			//failedtimecountseq.Insert(0.66, HOTween.To(timeCountGUI, 0.01, new TweenParms().Prop("color", new Color(1,0,0,1))));
			//failedtimecountseq.Insert(0, HOTween.To(timeCountGUI, 0.4, new TweenParms().Prop("color", new Color(1,0,0,1))));
		}
		//failedtimecountseq.Play();
		HOTween.To(timeCountGUI, 0.4, new TweenParms().Prop("color", new Color(1,0,0,1)));
	}else if(s=="failedlife"){
		if(failedlifeseq==null){
			//failedlifeseq=new Sequence(new SequenceParms().Loops(-1));
			//failedlifeseq.Insert(0.33, HOTween.To(lifeGUI, 0.01, new TweenParms().Prop("color", new Color(0,0,0,0))));
			//failedlifeseq.Insert(0.66, HOTween.To(lifeGUI, 0.01, new TweenParms().Prop("color", new Color(1,0,0,1))));
			//failedlifeseq.Insert(0, HOTween.To(lifeGUI, 0.4, new TweenParms().Prop("color", new Color(1,0,0,1))));
		}
		HOTween.To(lifeGUI, 0.4, new TweenParms().Prop("color", new Color(1,0,0,1)));
		//failedlifeseq.Play();
	}else if(s=="onplayerhitwall"){
		iTween.ShakePosition(lifeGUI.gameObject, new Vector3(10,10,0), 0.5);
	}else if(s=="onplayerhitmine"){
		iTween.ShakePosition(lifeGUI.gameObject, new Vector3(10,10,0), 0.5);
	}
}

function StopAnim(s:String){
	if(s=="all" || s=="failedlife") {
		if(failedlifeseq)failedlifeseq.Kill();
	}
	if(s=="all" || s=="failedtimecount"){
		if(failedtimecountseq)failedtimecountseq.Kill();
	}
}

function OnStat(s:String){
	if(s=="newgame"){
		StopAnim("all");
		lifeGUI.color=Color.white;
		timeCountGUI.color=Color.white;
		
		SetSpeed(0);
		SetLife(main.player.life);
		if(useIncreaseTimeCount)SetTimeCount(0);
		else SetTimeCount(maxTimeCount);
	}
}

function OnPauseBtnClick(){
	main.SetStat("pausegame");
}

function Awake() {
	sb=new StringBuilder();
}
function Start () {
	
	player=main.player;
}


function Update () {
	if(runTimeCount){
		if(useIncreaseTimeCount)
			SetTimeCount(timeCount+Time.deltaTime);
		else
			SetTimeCount(timeCount-Time.deltaTime);
		
	}
	
	SetSpeed(shipControl.velocity);
}