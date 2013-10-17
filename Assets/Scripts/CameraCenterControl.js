#pragma strict

var gameCamera:Camera;
var shipControl:ShipControl;

var useUpdateOrFixedUpdate:boolean=false;

var recoverDamping:float=1;

private var smp:Vector3;
private var wmp:Vector3;


var thrustVelociy:float=200;
private var thrustDirection:Vector3;
private var movevector:Vector3;
private var lerptovec:Vector3;
private var sw:float;
private var sh:float;

var hitWallPushBackDuration:float=1;

private var scenterp:Vector3;
private var wcenterp:Vector3;

private var shipcentering:boolean;

function Start () {
	sw=Screen.width;
	sh=Screen.height;
}

function _Update () {
	var sc:ShipControl=shipControl;

	if(sc.inputMode){
		if(sc.gesturePhase==2){
			this.transform.up=sc.gestureDir;
			
			thrustDirection=this.transform.up.normalized;
			movevector=thrustDirection*thrustVelociy*Time.deltaTime+shipControl.rigidbodyVelocity*Time.deltaTime;
			if(sc.lastExitWallTime<sc.lastHitWallTime) movevector+=(shipControl.transform.position-shipControl.gestureMid);
			movevector.z=0;
			this.transform.position+=movevector;
		}else{
			this.transform.position+=shipControl.rigidbodyVelocity*Time.deltaTime;
			//var sshipp:Vector3=gameCamera.WorldToScreenPoint(shipControl.transform.position);
			//var scenterp:Vector3=new Vector3(sw/2,sh/2,0);
		
			//lerptovec=shipControl.transform.position;
			//lerptovec.z=transform.position.z;
		
			//this.transform.position=Vector3.Lerp(transform.position,lerptovec,Time.deltaTime*recoverDamping);
		}
	}else{
		if(Input.GetMouseButton(0)){
			smp=Input.mousePosition;
			wmp=gameCamera.ScreenToWorldPoint(smp);
			
			wmp.z=this.transform.position.z;
			
			scenterp=new Vector3(sw/2,sh/2,0);
			wcenterp=gameCamera.ScreenToWorldPoint(scenterp);
			wcenterp.z=this.transform.position.z;
			
			this.transform.up=wmp-wcenterp;
			
			thrustDirection=(wmp-wcenterp).normalized;
			movevector=thrustDirection*thrustVelociy*Time.deltaTime+shipControl.rigidbodyVelocity*Time.deltaTime;
			this.transform.position+=movevector;
		}else{
			lerptovec=shipControl.transform.position;
			lerptovec.z=transform.position.z;
		
			this.transform.position=Vector3.Lerp(transform.position,lerptovec,Time.deltaTime*recoverDamping);
		}

		
	}
	
	
}

function Update(){
	if(useUpdateOrFixedUpdate)_Update();
}
function FixedUpdate(){
	if(!useUpdateOrFixedUpdate)_Update();
}