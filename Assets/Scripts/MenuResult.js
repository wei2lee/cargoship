#pragma strict

var main:Global;
var gameoverTM:tk2dTextMesh;
var congTM:tk2dTextMesh;
var distanceTM:tk2dTextMesh;
var gameTimeTM:tk2dTextMesh;

var gametime:float;
var distance:float;

private var sb:StringBuilder;

function Start () {

}

function OnRestartButtonClicked(){
	PlayAnim("out");
	yield WaitForSeconds(0.5);
	main.SetStat("reloadnewgame");
}

function PlayAnim(s:String){
	var anim:Animation=this.GetComponent(Animation);
	if(s=="infinish" || s=="ingameover"){
		if(s=="infinish"){
			gameoverTM.gameObject.SetActive(false);
			congTM.gameObject.SetActive(true);
		}else{
			gameoverTM.gameObject.SetActive(true);
			congTM.gameObject.SetActive(false);		
		}
		anim.Play("ResultGameOverInAnimation");
	}else if(s=="out"){
		anim.Play("ResultGameOverOutAnimation");
	}
}

function UpdateModel(){
	sb.Length=0;
	gametime=main.gameSession.endTime-main.gameSession.startTime;
	var iv:int=Mathf.Round(gametime);
	sb.Append("GameTime ").Append(iv).Append(" s");
	gameTimeTM.text=sb.ToString();
	
	sb.Length=0;
	distance=main.gameSession.distance; 
	iv=Mathf.Round(distance);
	sb.Append("Distance ").Append(iv).Append(" m");
	distanceTM.text=sb.ToString();
}

function Awake(){
	sb=new StringBuilder();
}

function Update () {

}