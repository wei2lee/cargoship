#pragma strict

var main:Global;


function Start () {

}

function OnResumeButtonClicked(){
	PlayAnim("out");
	yield WaitForSeconds(0.5);
	main.SetStat("resumegame");
}

function OnNewGameButtonClicked(){
	PlayAnim("out");
	yield WaitForSeconds(0.5);
	main.SetStat("newgame");
}


function PlayAnim(s:String){
	var anim:Animation=this.GetComponent(Animation);
	if(s=="in"){
		anim.Play("PauseInAnimation");
	}else if(s=="out"){
		anim.Play("PauseOutAnimation");
	}
}



function Update () {

}