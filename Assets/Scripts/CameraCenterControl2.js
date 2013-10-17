#pragma strict

var useUpdateOrFixedUpdate:boolean=false;
var shipControl:ShipControl2;

var targetShip:boolean=false;
var targetShipDamp:float=0.05;

function Start () {

}

function _Update () {
	var sc:ShipControl2=shipControl;
	//if(sc.inputMode){
	//if(!targetShip){
		transform.position+=sc.velocity*sc.direction*Time.deltaTime + sc.rigidbodyVelocity*Time.deltaTime;// + sc.collisionVelocity*Time.deltaTime;
		if(sc.wallCollisionPhase==2||sc.wallCollisionPhase==1||(Time.time-sc.lastHitWallTime<sc.hitWallDuration)){
			transform.position+=-sc.userVelocity*Time.deltaTime-sc.velocity*sc.direction*Time.deltaTime;
		}
	//}else{
	//	transform.position=shipControl.
	//}
	/*
	}else{
		if(Input.GetMouseButton(1)){
			transform.position+=sc.velocity*sc.direction*Time.deltaTime + sc.rigidbodyVelocity*Time.deltaTime;// + sc.collisionVelocity*Time.deltaTime;
			transform.position+=sc.userVelocity*Time.deltaTime;
			if(sc.wallCollisionPhase==2||sc.wallCollisionPhase==1||(Time.time-sc.lastHitWallTime<sc.hitWallDuration)){
				transform.position+=-sc.userVelocity*Time.deltaTime;
			}
		}
	}//*/
	
	if(Input.GetKey(KeyCode.A)) {
		var v:Vector3=shipControl.transform.position;
		v.z=transform.position.z;
		transform.position=Vector3.Lerp(transform.position,v,Time.deltaTime*2.5);
	}
}

function Update(){
	if(useUpdateOrFixedUpdate)_Update();
}
function FixedUpdate(){
	if(!useUpdateOrFixedUpdate)_Update();
}

function PlayAnim(s:String){
	if(s=="toship"){
		HOTween.To(transform, 1, new TweenParms().Prop("position", shipControl.transform.position).Ease(EaseType.EaseOutCubic));
	}
}