#pragma strict

import Holoville.HOTween.Plugins;

var shipSprite:tk2dBaseSprite;
var obstacleCollisionCollider:Transform;
var main:Global;
var gameHUD:GameHUD;
var gestureControl:GestureControl;
var gameCamera:Camera;
var cameraCenterControl:CameraCenterControl2;
var fingers:tk2dBaseSprite[];
var particleTail:ParticleSystem;
var particleSide:ParticleSystem;
var particleShatter:ParticleSystem;

var paticleExplosion1:ParticleSystem;
var paticleExplosion2:ParticleSystem;
var paticleExplosion3:ParticleSystem;

var inputMode:boolean=false;
var inputEnabled:boolean=true;

private var fingerSpIds:int[];

var useUpdateOrFixedUpdate:boolean=false;

var movePositionDamping:float=10;
var moveRotationDamping:float=10;

var dvelocity:float;

private var _velocityLifeFactor:float;
var velocityLifeFactor:float;
var useVelocityLifeFactor:boolean=true;
var upperLife:float=100;
var lowerLife:float=20;
var maxVelocityLifeFactor:float=1;
var minVelocityLifeFactor:float=0.2;


var maxVelocity:float=400;
var velocity:float;
var acceleration:float=200;
var direction:Vector3;

private var smp:Vector3;
private var wmp:Vector3;

private var moveposition:Vector3;
private var moverotation:Quaternion;


var rigidbodyVelocity:Vector3;
var userVelocity:Vector3;

var lastHitWallTime:float=0;
var lastExitWallTime:float=0;
var isCollisionStay:boolean;
var hitWallDuration:float=0.1;

var deleteLifeTimeout:float=2;
var lastDeleteLifeTime:float=0;

var deleteVelocityObstacleFactor:float=0;
var deleteVelocityObstacleRecover:float=0.33;

private var sw:float;
private var sh:float;
private var centersp:Vector3;
private var centerwp:Vector3;

var collisionVelocity:Vector3;
var collisionDeacceraltion:float=100;

var particleShatterTimeout:float=0.1;
var lastParticleShatterTime:float;
var particleShatterRelativeVelocityThredhold:float=1;

class CollisionInfo{
	var cldr:Collider;
	var phase:int;
}
var wallCollisionPhase:int;

var userDrag:float=1000;
var freeDrag:float=1;

var userAngularDrag:float=1000;
var freeAngularDrag:float=1;

private var wallCollisionInfos:CollisionInfo[];
var movevalue:float=50;

var lastPosition:Vector3;
var gameStartPosition:Vector3;
var gameStartRotation:Quaternion;



function Awake() {
	var i:int;
	particleShatter.enableEmission=false;
	particleShatter.emissionRate=0;
	particleShatters=new ParticleSystem[20];
	for(i=0;i<particleShatters.Length;i++){
		particleShatters[i]=GameObject.Instantiate(particleShatter.gameObject).GetComponent(ParticleSystem);
		particleShatters[i].transform.parent=particleShatter.transform.parent;
		particleShatters[i].gameObject.SetActive(true);
	}

	fingerSpIds=new int[2];
	fingerSpIds[0]=fingers[0].GetSpriteIdByName ("finger");
	fingerSpIds[1]=fingers[0].GetSpriteIdByName ("finger_2");
	
	sw=Screen.width;
	sh=Screen.height;
	
	centersp=new Vector3(sw/2,sh/2,0);
	
	gameStartPosition=transform.position;
	gameStartRotation=transform.rotation;
}

function Start() {
}

function OnSetStat(s:String){
	var i:int;
	var j:int;
	if(s=="newgame"){
		shipSprite.gameObject.SetActive(true);
		for(var f:tk2dBaseSprite in fingers){
			f.gameObject.SetActive(true);
		}
		paticleExplosion1.gameObject.SetActive(false);
		paticleExplosion2.gameObject.SetActive(false);
		paticleExplosion3.gameObject.SetActive(false);
	}
}

public var vlife:float=0;
function OnCollisionEnter(collision : Collision) {
	var i:int; var j:int;
	var gameover:boolean;
	
	var cldr:Collider=collision.collider;
	var ob:Obstacle=cldr.GetComponent(Obstacle);
	
	if(ob && ob.type==Obstacle.WALL){
		lastHitWallTime=Time.time;
		wallCollisionPhase=1;
	}
	if(ob){
		ob.lastHitPlayerTime=Time.time;
		deleteVelocityObstacleFactor=Mathf.Max(0,deleteVelocityObstacleFactor-ob.GetDeleteVelocityFactor());
		/*
		for (var contact : ContactPoint in collision.contacts) {
			var cy:float=Mathf.Lerp(-10,10,Random.value);
			
			Debug.DrawRay(contact.point+new Vector3(0,0,cy), contact.normal*100, Color.red, 5);
			Debug.DrawLine(contact.point+new Vector3(-10,-10,cy), contact.point+new Vector3(10,-10,cy), Color.red, 5);
			Debug.DrawLine(contact.point+new Vector3(10,-10,cy), contact.point+new Vector3(10,10,cy), Color.red, 5);
			Debug.DrawLine(contact.point+new Vector3(10,10,cy), contact.point+new Vector3(-10,10,cy), Color.red, 5);
			Debug.DrawLine(contact.point+new Vector3(-10,10,cy), contact.point+new Vector3(-10,-10,cy), Color.red, 5);
		}//*/
		
		
		
		if((ob.type==Obstacle.WALL && Time.time-lastDeleteLifeTime>deleteLifeTimeout) || (ob.type==Obstacle.LOG && ob.lastHitPlayerTime) || ob.type==Obstacle.MINE){
			if(ob.type==Obstacle.WALL) lastDeleteLifeTime=Time.time;
			
			
			vlife=gameHUD.life;
			
			main.player.SetLife(main.player.life-ob.GetDeleteLife());
			
			HOTween.To(this, 0.5, new TweenParms().Prop("vlife",main.player.life).OnUpdate(UpdateGameHUDLife));
			
			if(main.player.life<=0 && gameHUD.timeCount<=0){
				paticleExplosion1.gameObject.SetActive(true);
				paticleExplosion2.gameObject.SetActive(true);
				paticleExplosion3.gameObject.SetActive(true);
				shipSprite.gameObject.SetActive(false);
				for(var f:tk2dBaseSprite in fingers){
					f.gameObject.SetActive(false);
				}
			}
		}
		
		if((ob.type==Obstacle.WALL && Time.time-lastParticleShatterTime>particleShatterTimeout) || ob.type==Obstacle.MINE){
			if(ob.type==Obstacle.MINE){
				 iTween.ShakePosition(gameCamera.gameObject, new Vector3(100,100,0), 0.5); 
				 ob.PlayAnim("onplayerhit");
				 gameHUD.PlayAnim("onplayerhitmine");
			}
			if(ob.type==Obstacle.WALL){
				iTween.ShakePosition(gameCamera.gameObject, new Vector3(20,20,0), 0.5); 
				gameHUD.PlayAnim("onplayerhitwall");
			}
		
			lastParticleShatterTime=Time.time;
			
			var emitmax:float=5; var emitv:float;
			emitv=emitmax;
			for(i=0;i<collision.contacts.Length && i<2;i++){
				var ps:ParticleSystem=AllocParticleShatter();
				ps.transform.position=collision.contacts[i].point;
				ps.transform.position.z=-100;
				ps.transform.rotation=Quaternion.LookRotation(collision.contacts[i].normal, new Vector3(0,0,1));
				ps.Emit(emitv);
				
				
				//Debug.DrawRay(transform.position, new Vector3(0,100,0), Color.red);
			}
			//Debug.Log("contact.points.length="+collision.contacts.Length);
			//Debug.Log("collision.relativeVelocity.sqrMagnitude="+collision.relativeVelocity.sqrMagnitude);
		}
		

	}
}

private function UpdateGameHUDLife(){
	//Debug.Log("UpdateGameHUDLife vlife="+vlife); 
	gameHUD.SetLife(vlife);
}


private var particleShatters:ParticleSystem[];
private var particleShatterIndex:int;

function AllocParticleShatter():ParticleSystem {
	var reti:int=particleShatterIndex;
	particleShatterIndex++;
	particleShatterIndex=particleShatterIndex%particleShatters.Length;
	return particleShatters[reti];
}


function OnCollisionStay(collision : Collision) {
	var i:int;
	if(collision.gameObject.CompareTag("obstacle_wall")){
		lastHitWallTime=Time.time;
		wallCollisionPhase=2;
		
		/*
		var cp:ContactPoint;
		
		for(i=0;i<collision.contacts.Length;i++){
			collisionVelocity-=collision.contacts[i].normal*collision.relativeVelocity.magnitude;
		}
		
		for (var contact : ContactPoint in collision.contacts) {
			//print(contact.thisCollider.name + " hit " + contact.otherCollider.name);
			// Visualize the contact point
			Debug.DrawRay(contact.point, contact.normal*1000, Color.white, 1);
		}
		//*/
		
	}
}
function OnCollisionExit(collision : Collision) {
	if(collision.gameObject.CompareTag("obstacle_wall")){
		lastExitWallTime=Time.time;
		wallCollisionPhase=0;
	}
}

function OnTriggerEnter(collider:Collider) {
	if(collider.CompareTag("trigger_goal") && main.stat!="result" && main.stat!="gameover"){
		main.SetStat("result");
	}
}


function _Update () {
	


	var i:int; var j:int;
	var ray:Ray;
	var hit:RaycastHit;
	var m:int;
	var gc:GestureControl=gestureControl;


	var mag:float=collisionVelocity.magnitude;
	if(mag<=collisionDeacceraltion*Time.deltaTime)collisionVelocity=Vector3.zero;
	else collisionVelocity*=(mag-collisionDeacceraltion*Time.deltaTime)/mag;
	
	if(useVelocityLifeFactor){
		velocityLifeFactor=Mathf.Lerp(minVelocityLifeFactor,maxVelocityLifeFactor,(main.player.life-lowerLife)/(upperLife-lowerLife));
	}else {
		velocityLifeFactor=1;
	}
	_velocityLifeFactor=Mathf.Lerp(_velocityLifeFactor,velocityLifeFactor,Time.deltaTime*10);
	
	deleteVelocityObstacleFactor=Mathf.Clamp(deleteVelocityObstacleFactor+deleteVelocityObstacleRecover*Time.deltaTime,0,1);

	if(inputMode){
		if(gc.gesturePhase==1||gc.gesturePhase==2&&!main.gameSession.userStartedGame){
			main.SetStat("userstartgame");
		}
	
		for(i=0;i<fingers.Length;i++){
			for(j=0;j<3 && j<Input.touchCount;j++){
				if(fingers[i].collider.Raycast(gameCamera.ScreenPointToRay(Input.GetTouch(j).position), hit, 10000)){
					m|=1<<i;	
				}
			}
		}
		for(i=0;i<fingers.Length;i++){
			if(m&(1<<i)) fingers[i].SetSprite(fingerSpIds[1]);
			else fingers[i].SetSprite(fingerSpIds[0]);
		}
		
		if(gc.gesturePhase==1||gc.gesturePhase==2){
			if(!inputEnabled){
				velocity=Mathf.Lerp(velocity, 0, Time.deltaTime*10);			
			}else{
				dvelocity=Mathf.Clamp(dvelocity+acceleration*Time.deltaTime,0,maxVelocity);
				velocity=dvelocity*_velocityLifeFactor*deleteVelocityObstacleFactor;			
			}
		

		
			if(wallCollisionPhase==2||wallCollisionPhase==1||(Time.time-lastHitWallTime<hitWallDuration)){
				velocity=0;
			}
			
			wmp=gc.gestureMid;
			wmp.z=this.transform.position.z;
			
			direction=gc.gestureDir;
			direction=direction.normalized;
			
			if(main.stat=="gameover"||main.stat=="result"){
				userVelocity=Vector3.zero;
			}else{
				userVelocity=(Vector3.Lerp(rigidbody.position,wmp,movePositionDamping*Time.deltaTime) - rigidbody.position) / Time.deltaTime;
				if((userVelocity*Time.deltaTime).sqrMagnitude<3){
					userVelocity=Vector3.zero;
				}
			}
			
			
			moveposition=rigidbody.position+direction*velocity*Time.deltaTime + userVelocity*Time.deltaTime;
			rigidbody.MovePosition(moveposition);
		
		
			if(inputEnabled){
				moverotation=Quaternion.Lerp(rigidbody.rotation, Quaternion.LookRotation(new Vector3(0,0,1), direction), moveRotationDamping*Time.deltaTime);
				rigidbody.MoveRotation(moverotation);
			}
		
		}else{
			if(!inputEnabled){
				velocity=Mathf.Lerp(velocity, 0, Time.deltaTime*10);	
			}else{
				dvelocity=Mathf.Clamp(dvelocity-acceleration*Time.deltaTime,0,maxVelocity);
				velocity=dvelocity*_velocityLifeFactor*deleteVelocityObstacleFactor;
			}
		
			if(wallCollisionPhase==2||wallCollisionPhase==1||(Time.time-lastHitWallTime<hitWallDuration)){
				velocity=0;
			}
			
			userVelocity=Vector3.zero;
				
			moveposition=rigidbody.position+direction*velocity*Time.deltaTime;
			rigidbody.MovePosition(moveposition);
		}
	}else{
		/*
		var mv:Vector3;
		if(Input.GetKeyDown(KeyCode.LeftArrow)) mv+=new Vector3(-movevalue,0,0);
		if(Input.GetKeyDown(KeyCode.RightArrow)) mv+=new Vector3(movevalue,0,0);
		if(Input.GetKeyDown(KeyCode.UpArrow)) mv+=new Vector3(0,movevalue,0);
		if(Input.GetKeyDown(KeyCode.DownArrow)) mv+=new Vector3(0,-movevalue,0);
		
		if(Input.GetKeyDown(KeyCode.A)) {
			//HOTween.To(transform.position, 2, new TweenParms().Prop("y",100));
			//HOTween.To(transform, 2, new TweenParms().Prop("position",new Vector3(0,100,0)));
		}
		
		rigidbody.MovePosition(rigidbody.position+mv);//*/
		/*
		
		//if(direction!=Vector3.zero){
			userVelocity=Vector3.zero;
		
			direction=direction.normalized;
			moveposition=rigidbody.position+direction*velocity*Time.deltaTime + userVelocity*Time.deltaTime;
			rigidbody.MovePosition(moveposition);
		//}
		//*/
		if(true){
	
		if(Input.GetMouseButton(0)){
			if(!main.gameSession.userStartedGame){
				main.SetStat("userstartgame");
				return;
			}
		
			if(!inputEnabled){
				velocity=Mathf.Lerp(velocity, 0, Time.deltaTime*10);			
			}else{
				dvelocity=Mathf.Clamp(dvelocity+acceleration*Time.deltaTime,0,maxVelocity);
				velocity=dvelocity*_velocityLifeFactor*deleteVelocityObstacleFactor;
				
			}
			
			if(wallCollisionPhase==2||wallCollisionPhase==1||(Time.time-lastHitWallTime<hitWallDuration)){
				//velocity=-maxVelocity;
				//velocity=0;
			}
			if(wallCollisionPhase==2||wallCollisionPhase==1||(Time.time-lastHitWallTime<hitWallDuration)){
				rigidbody.drag=freeDrag;
				//rigidbody.angularDrag=freeAngularDrag;
			}else{
				rigidbody.drag=userDrag;
				rigidbody.angularDrag=userAngularDrag;			
			}
			

			
			
			smp=Input.mousePosition;
			wmp=gameCamera.ScreenToWorldPoint(smp);
			wmp.z=this.transform.position.z;
	
			//centerwp=gameCamera.ScreenToWorldPoint(centersp);
			//direction=wmp-centerwp;
			//direction.z=0;
			
			direction=wmp-transform.position;
			direction.z=0;
			
			direction=direction.normalized;
			direction.z=0;
			//direction=new Vector3(0,1,0);
						
			/*
			if(!inputEnabled){
				userVelocity=Vector3.zero;
			}else{					
				userVelocity=(Vector3.Lerp(rigidbody.position,wmp,movePositionDamping*Time.deltaTime) - rigidbody.position) / Time.deltaTime;
				if((userVelocity*Time.deltaTime).sqrMagnitude<20){
					userVelocity=Vector3.zero;
				}
				if(wallCollisionPhase==2||wallCollisionPhase==1||(Time.time-lastHitWallTime<hitWallDuration)){
					userVelocity=Vector3.zero;
				}
			}//*/
			userVelocity=Vector3.zero;

			
			
			
			moveposition=rigidbody.position+direction*velocity*Time.deltaTime + userVelocity*Time.deltaTime;
			rigidbody.MovePosition(moveposition);
	
			//if(wallCollisionPhase==2||wallCollisionPhase==1||(Time.time-lastHitWallTime<hitWallDuration)){

			//}else{
				//if((userVelocity*Time.deltaTime).sqrMagnitude<4){
					if(inputEnabled){
						moverotation=Quaternion.Lerp(rigidbody.rotation, Quaternion.LookRotation(new Vector3(0,0,1), direction), moveRotationDamping*Time.deltaTime);
						rigidbody.MoveRotation(moverotation);			
					}
				//}
			//}
	

		}else{
			if(!inputEnabled){
				velocity=Mathf.Lerp(velocity, 0, Time.deltaTime*10);	
			}else{	
				dvelocity=Mathf.Clamp(dvelocity-acceleration*Time.deltaTime,0,maxVelocity);
				velocity=dvelocity*_velocityLifeFactor*deleteVelocityObstacleFactor;
			}
		
			if(wallCollisionPhase==2||wallCollisionPhase==1||(Time.time-lastHitWallTime<hitWallDuration)){
				velocity=0;
			}
			
			rigidbody.drag=freeDrag;
			rigidbody.angularDrag=freeAngularDrag;
			
			userVelocity=Vector3.zero;
				
			moveposition=rigidbody.position+direction*velocity*Time.deltaTime;
			rigidbody.MovePosition(moveposition);
		}
		}
	}
	
	
	main.gameSession.distance+=(transform.position-lastPosition).sqrMagnitude * main.distanceFactor;
	lastPosition=transform.position;
	
	particleSide.emissionRate=Mathf.Lerp(0, 100, Mathf.Abs(velocity)/(maxVelocity));
	particleTail.emissionRate=Mathf.Lerp(0, 50, Mathf.Abs(velocity)/(maxVelocity));
	
	rigidbodyVelocity=rigidbody.velocity;
}

function Update(){
	if(useUpdateOrFixedUpdate)_Update();
}
function FixedUpdate(){
	if(!useUpdateOrFixedUpdate)_Update();
}

function OnDrawGizmos() {
	//Gizmos.color=Color.red;
	//Gizmos.DrawWireCube(Vector3.zero, new Vector3(768,1024, 400));
}