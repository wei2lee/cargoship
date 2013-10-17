#pragma strict

var testShipPos:tk2dBaseSprite;
var testGMid:tk2dBaseSprite;


var gameCamera:Camera;
var fingers:tk2dBaseSprite[];
var cameraCenterControl:CameraCenterControl;
private var fingerSpIds:int[];

var inputMode:boolean;
var useFixGesture:boolean;
var useUpdateOrFixedUpdate:boolean=false;

var movePositionDamping:float=10;
var moveRotationDamping:float=10;

private var smp:Vector3;
private var wmp:Vector3;

private var moveposition:Vector3;
private var moverotation:Quaternion;

@HideInInspector
var rigidbodyVelocity:Vector3;

var pushBackFactor:float=0;
var pushBackFactorSpd:float=0.01;
@HideInInspector
var lastHitWallTime:float=0;
var lastExitWallTime:float=0;


var gesturePhase:int;//0=unidentified 1=began 2=change 3=ended/cancelled
private var lens:float[]=new float[3];
private var topp:Vector3;
private var tail1p:Vector3;
private var tail2p:Vector3;


var gestureMidDelta:Vector3;
var gestureBeganMid:Vector3;
var gestureLastMid:Vector3;
var gestureMid:Vector3;
var gestureDir:Vector3;
var gestureRot:Quaternion;
var gestureMidOffset:float=60;

function GetGestureInfo():boolean{
	lens[0]=(Input.GetTouch(0).position-Input.GetTouch(1).position).sqrMagnitude;
	lens[1]=(Input.GetTouch(1).position-Input.GetTouch(2).position).sqrMagnitude;
	lens[2]=(Input.GetTouch(2).position-Input.GetTouch(0).position).sqrMagnitude;
	if(lens[0]<=lens[1]&&lens[0]<=lens[2]){
		topp=Input.GetTouch(2).position;
		tail1p=Input.GetTouch(0).position;
		tail2p=Input.GetTouch(1).position;
	}else if(lens[1]<=lens[0]&&lens[1]<=lens[2]){
		topp=Input.GetTouch(0).position;
		tail1p=Input.GetTouch(1).position;
		tail2p=Input.GetTouch(2).position;
	}else if(lens[2]<=lens[0]&&lens[2]<=lens[1]){
		topp=Input.GetTouch(1).position;
		tail1p=Input.GetTouch(0).position;
		tail2p=Input.GetTouch(2).position;
	}

	if(gesturePhase==2) gestureLastMid=gestureMid;
	//gestureMid=gameCamera.ScreenToWorldPoint((topp+tail1p+tail2p)/3);
	gestureMid=gameCamera.ScreenToWorldPoint((topp+(tail1p+tail2p)/2)/2);
	if(gesturePhase==1) gestureLastMid=gestureBeganMid=gestureMid;
	
	gestureMidDelta=gestureMid-gestureLastMid;
	
	gestureDir=gameCamera.ScreenToWorldPoint(topp)-gestureMid;
	gestureRot=Quaternion.LookRotation(new Vector3(0,0,1),gestureDir);
	return true;
}
function CheckGestureBegin():boolean{
	if(Input.touchCount<3)return false;
	
	if(Input.GetTouch(0).phase!=TouchPhase.Began&&
	Input.GetTouch(1).phase!=TouchPhase.Began&&
	Input.GetTouch(2).phase!=TouchPhase.Began){
		return false;
	}
	if(useFixGesture){
		var m:int=0;
		var i:int;
		var j:int;
		var hit:RaycastHit;
		for(i=0;i<3;i++){
			var p:Vector3=Input.GetTouch(i).position;
			var ray:Ray=gameCamera.ScreenPointToRay(p);
			for(j=0;j<3;j++){
				//if(m&(1<<j)==0){
					var cldr:Collider=fingers[j].collider;
					var ret:boolean=cldr.Raycast(ray, hit, 10000);
					if(ret){
						m|=1<<j;
					}
					//Debug.Log("i="+i+",j="+j+"ret="+ret+",m="+m);
				//}
			}
		}
		
		return m==7;
	}else{
		return true;
	}
}

function CheckGestureEnd():boolean{
	return Input.touchCount<3;
}

function Start () {
	fingerSpIds=new int[2];
	fingerSpIds[0]=fingers[0].GetSpriteIdByName ("finger");
	fingerSpIds[1]=fingers[0].GetSpriteIdByName ("finger_2");
}

function OnCollisionEnter(collision : Collision) {
	if(collision.collider.CompareTag("obstacle_wall")){
		lastHitWallTime=Time.time;
	}
}
function OnCollisionStay(collision : Collision) {
	if(collision.collider.CompareTag("obstacle_wall")){
		lastHitWallTime=Time.time;
	}
}
function OnCollisionExit(collision : Collision) {
	if(collision.collider.CompareTag("obstacle_wall")){
		lastExitWallTime=Time.time;
	}
}


function _Update () {
	var i:int; var j:int;
	var ray:Ray;
	var hit:RaycastHit;
	var m:int;
	if(inputMode){
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
	
	
		if(gesturePhase==0||gesturePhase==3){
			if(CheckGestureBegin())gesturePhase=1;
		}
		if(gesturePhase==1||gesturePhase==2){
			if(CheckGestureEnd()){
				gesturePhase=3;
			}else if(gesturePhase==1){
				GetGestureInfo();
				gesturePhase=2;
			}else if(gesturePhase==2){
				GetGestureInfo();
				
				//var middelta:Vector3=gestureMidDelta; middelta.z=0;
				var wgm:Vector3=gestureMid; wgm.z=rigidbody.position.z;
				//moveposition=Vector3.Lerp(rigidbody.position,rigidbody.position+middelta,movePositionDamping*Time.deltaTime);
				moveposition=Vector3.Lerp(rigidbody.position,wgm,movePositionDamping*Time.deltaTime);
				rigidbody.MovePosition(moveposition);

				moverotation=Quaternion.Lerp(rigidbody.rotation, gestureRot, moveRotationDamping*Time.deltaTime);
				rigidbody.MoveRotation(moverotation);
				
				
				
				testGMid.transform.position=gestureMid;
				testShipPos.transform.position=transform.position;
			}
		}else if(gesturePhase==2){
			gesturePhase=0;
		}
		
	}else{
		if(Input.GetMouseButton(0)){
			smp=Input.mousePosition;
			wmp=gameCamera.ScreenToWorldPoint(smp);
			
			wmp.z=this.transform.position.z;
			
			moveposition=Vector3.Lerp(rigidbody.position,wmp,movePositionDamping*Time.deltaTime);
			rigidbody.MovePosition(moveposition);

			moverotation=Quaternion.Lerp(rigidbody.rotation, cameraCenterControl.transform.rotation, moveRotationDamping*Time.deltaTime);
			rigidbody.MoveRotation(moverotation);
		}
	}
	
	rigidbodyVelocity=rigidbody.velocity;
}

function Update(){
	if(useUpdateOrFixedUpdate)_Update();
}
function FixedUpdate(){
	if(!useUpdateOrFixedUpdate)_Update();
}

function OnDrawGizmos() {
	
}