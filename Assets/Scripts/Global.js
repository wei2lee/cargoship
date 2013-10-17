#pragma strict

class Player {
	var life:float=100;
	var maxLife:float=100;
	
	function SetLife(v:float){
		if(life==Mathf.Clamp(v,0,maxLife))return;
		life=Mathf.Clamp(v,0,maxLife);
	}
}

class GameSession {

	var warnedTimeCount:boolean;
	var failedTimeCount:boolean=false;
	var warnedLife:boolean;
	var failedLife:boolean=false;
	var userStartedGame:boolean=false;
	var startTime:float=0;
	var endTime:float=0;
	var distance:float;
}
var root:GameObject;
var hudCamera:Camera;
var gameCamera:Camera;
var gameCameraFollow:CameraFollow;
var gameCameraTK:tk2dCamera;
var menuLanding:MenuLanding;
var menuPause:MenuPause;
var menuResult:MenuResult;
var gameHUD:GameHUD;


var shipControl:ShipControl2;
var cameraCenterControl:CameraCenterControl2;


var player:Player;
var gameSession:GameSession;
var distanceFactor:float=0.01;
var stat:String;

public function SetStat(s:String) {
	if(s==stat)return;
	var oldstat:String=stat;
	Debug.Log(oldstat+">"+s);
	
	stat=s;
	if(stat=="reset"){
		menuLanding.gameObject.SetActive(false);
		gameHUD.gameObject.SetActive(false);
		menuPause.gameObject.SetActive(false);
		menuResult.gameObject.SetActive(false);
		shipControl.gameObject.SetActive(true);
		shipControl.enabled=false;
		cameraCenterControl.enabled=false;
		gameCameraFollow.enabled=false;
	}else if(stat=="landing"){
		cameraCenterControl.enabled=false;
	
		menuLanding.gameObject.SetActive(true);
		menuLanding.PlayAnim("in");
	}else if(stat=="newgame"){
		cameraCenterControl.enabled=true;
	
		player.life=player.maxLife;
		
		
		shipControl.gameObject.SetActive(true);
		shipControl.enabled=true;
		shipControl.inputEnabled=false;
	
		
		shipControl.lastPosition=shipControl.transform.position=shipControl.gameStartPosition;
		if(!(oldstat=="result"||oldstat=="gameover")){
			cameraCenterControl.transform.position=shipControl.transform.position;	
		}else{
			cameraCenterControl.PlayAnim("toship");
		}			
		
		cameraCenterControl.enabled=true;
		cameraCenterControl.transform.rotation=shipControl.transform.rotation=shipControl.gameStartRotation;
		
		gameCameraFollow.enabled=true;
		
		shipControl.paticleExplosion1.gameObject.SetActive(false);
		shipControl.paticleExplosion2.gameObject.SetActive(false);
		shipControl.paticleExplosion3.gameObject.SetActive(false);
		shipControl.shipSprite.gameObject.SetActive(true);
		for(var f:tk2dBaseSprite in shipControl.fingers){
			f.gameObject.SetActive(true);
		}
		
		gameHUD.gameObject.SetActive(true);
		gameHUD.OnStat(s);
		
		gameSession=new GameSession();
		
		gameHUD.PlayAnim("in");
	}else if(stat=="userstartgame"){
		shipControl.inputEnabled=true;
	
		gameSession.startTime=Time.time;
		gameSession.userStartedGame=true;
		gameHUD.runTimeCount=true;
	}else if(stat=="result"){
		shipControl.inputEnabled=false;
		gameSession.endTime=Time.time;
		menuResult.gameObject.SetActive(true);
		menuResult.UpdateModel();
		menuResult.PlayAnim("infinish");
		gameHUD.runTimeCount=false;
	}else if(stat=="gameover"){
		shipControl.inputEnabled=false;
		gameSession.endTime=Time.time;
		menuResult.gameObject.SetActive(true);
		menuResult.UpdateModel();
		menuResult.PlayAnim("ingameover");	
		gameHUD.runTimeCount=false;
	}else if(stat=="reloadnewgame"){
		gameHUD.StopAnim("all");
		HOTween.Kill();
		Application.LoadLevel(0);
	}
	
	menuLanding.AfterSetStat(stat, oldstat);
}

function Start () {
#if UNITY_EDITOR
	Debug.Log("HOTween.VERSION="+HOTween.VERSION);
#endif
	
	var tc:GameObject=GameObject.Find("TerrainCollider");
	var rdrs:Component[]=tc.GetComponentsInChildren(Renderer);
	for(var rdr:Renderer in rdrs) rdr.enabled=false;
	

	
	
	Application.targetFrameRate=60;
	SetStat("reset");
	SetStat("landing");
}

function Update () {
	if(stat!="gameover"&&stat!="result"&&gameHUD.timeCount==0&&player.life==0){
		SetStat("gameover");
	}
}

function OnDrawGizmos(){
	var p:Vector3=hudCamera.transform.position;
	p.z=0;
	
	Gizmos.color=Color.red;
	Gizmos.DrawWireCube(p,new Vector3(768,1024,200));
}

//helper function
static function createRandomTween(o, prop:String, from:float, amountbounds:float[], nextdelaybounds:float[], mindistbounds:float[], n:float):Sequence{
	var seq:Sequence=new Sequence(new SequenceParms().Loops(float.PositiveInfinity, LoopType.Yoyo));
	var i:int;
	var to:float;
	var a:float;
	var amount:float;
	var tofromd:float;
	var maxtofromloop:int=100;
	var tofromloop:int=0;
	
	
	var delay:float=0;
	var nextdelay:float=0;
	
	var dc:Color=new Color();
	
	for(i=0;i<n;i++){
		tofromloop=0;
		to=from;
		amount=Random.Range(amountbounds[0],amountbounds[1]);
		to+=amount;
		nextdelay=Random.Range(nextdelaybounds[0], nextdelaybounds[1]);
		seq.Insert(delay, HOTween.To(o, nextdelay, new TweenParms().Prop(prop, to).Ease(EaseType.EaseInOutQuad)));
		delay+=nextdelay; 
	}
	return seq;
}

static function createRandomTweenRotation(o, prop:String, from:Quaternion, amountbounds:Quaternion[], nextdelaybounds:float[], mindistbounds:float[], n:float):Sequence{
	var seq:Sequence=new Sequence(new SequenceParms().Loops(float.PositiveInfinity, LoopType.Yoyo));
	var i:int;
	var to:Quaternion;
	var a:float;
	var amount:Quaternion;
	var tofromd:float;
	
	var delay:float=0;
	var nextdelay:float=0;
	
	var dc:Color=new Color();
	
	for(i=0;i<n;i++){
		

		
		amount=Quaternion.Lerp(amountbounds[0], amountbounds[1], Random.value);
		to=from*amount;
		
		nextdelay=Random.Range(nextdelaybounds[0], nextdelaybounds[1]);
		
		seq.Insert(delay, HOTween.To(o, nextdelay, new TweenParms().Prop(prop, to).Ease(EaseType.EaseInOutQuad)));
		delay+=nextdelay; 
	}
	return seq;
}

static function createRandomTweenRectangleVector3(o, prop:String, from:Vector3, amountbounds:Vector3[], nextdelaybounds:float[], mindistbounds:float[], n:float):Sequence{
	var seq:Sequence=new Sequence(new SequenceParms().Loops(float.PositiveInfinity, LoopType.Yoyo));
	var i:int;
	var to:Vector3;
	var a:float;
	var amount:Vector3;
	var tofromd:float;
	var maxtofromloop:int=100;
	var tofromloop:int=0;
	
	
	var delay:float=0;
	var nextdelay:float=0;
	
	var dc:Color=new Color();
	
	for(i=0;i<n;i++){
		tofromloop=0;

		to=from;
		amount.x=Random.Range(amountbounds[0].x,amountbounds[1].x);
		amount.y=Random.Range(amountbounds[0].y,amountbounds[1].y);
		amount.z=Random.Range(amountbounds[0].z,amountbounds[1].z);
		
		to+=amount;
		
		tofromd=(to-from).sqrMagnitude;

		nextdelay=Random.Range(nextdelaybounds[0], nextdelaybounds[1]);
		
		seq.Insert(delay, HOTween.To(o, nextdelay, new TweenParms().Prop(prop, to).Ease(EaseType.EaseInOutQuad)));
		delay+=nextdelay; 
		 
		
		dc=Color.red;
		Debug.DrawLine(to+new Vector3(3,3,0), to+new Vector3(-3,3,0), dc, 60);
		Debug.DrawLine(to+new Vector3(-3,3,0), to+new Vector3(-3,-3,0), dc, 60);
		Debug.DrawLine(to+new Vector3(-3,-3,0), to+new Vector3(3,-3,0), dc, 60);
		Debug.DrawLine(to+new Vector3(3,-3,0), to+new Vector3(3,3,0), dc, 60);
	}
	return seq;
}

static function createRandomTweenCircleVector3(o, prop:String, from:Vector3, amountbounds:float[], nextdelaybounds:float[], mindistbounds:float[], n:float):Sequence{
	var seq:Sequence=new Sequence(new SequenceParms().Loops(float.PositiveInfinity, LoopType.Yoyo));
	var i:int;
	var to:Vector3;
	var a:float;
	var amount:float;
	var tofromd:float;
	var maxtofromloop:int=100;
	var tofromloop:int=0;
	
	
	var delay:float=0;
	var nextdelay:float=0;
	
	var dc:Color=new Color();
	
	for(i=0;i<n;i++){
		tofromloop=0;

		to=from;
		a=Random.Range(0,Mathf.PI*2);
		amount=Random.Range(amountbounds[0],amountbounds[1]);
		to.x+=amount*Mathf.Cos(a);
		to.y+=amount*Mathf.Sin(a);
			

		nextdelay=Random.Range(nextdelaybounds[0], nextdelaybounds[1]);
		
		seq.Insert(delay, HOTween.To(o, nextdelay, new TweenParms().Prop(prop, to).Ease(EaseType.EaseInOutQuad)));
		delay+=nextdelay; 
		 
		
		dc=Color.red;
		Debug.DrawLine(to+new Vector3(3,3,0), to+new Vector3(-3,3,0), dc, 60);
		Debug.DrawLine(to+new Vector3(-3,3,0), to+new Vector3(-3,-3,0), dc, 60);
		Debug.DrawLine(to+new Vector3(-3,-3,0), to+new Vector3(3,-3,0), dc, 60);
		Debug.DrawLine(to+new Vector3(3,-3,0), to+new Vector3(3,3,0), dc, 60);
	}
	return seq;
}