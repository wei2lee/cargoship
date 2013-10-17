#pragma strict

var gameCamera:Camera;
var fingers:tk2dBaseSprite[];

var useFixGesture:boolean;
var useUpdateOrFixedUpdate:boolean=false;


var gesturePhase:int;//0=unidentified 1=began 2=change 3=ended/cancelled
private var lens:float[]=new float[3];
private var topp:Vector3;
private var tail1p:Vector3;
private var tail2p:Vector3;
private var fingerIds:int[];
private var fingerTouches:Touch[];



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
	gestureMid=gameCamera.ScreenToWorldPoint((topp+(tail1p+tail2p)/2)/2);
	if(gesturePhase==1) gestureLastMid=gestureBeganMid=gestureMid;
	
	gestureMidDelta=gestureMid-gestureLastMid;
	
	gestureDir=gameCamera.ScreenToWorldPoint(topp)-gestureMid;
	gestureDir=gestureDir.normalized;
	
	gestureRot=Quaternion.LookRotation(new Vector3(0,0,1),gestureDir);
	return true;
}


function CheckGestureBegin():boolean{
	var i:int; var j:int;
	var t:Touch;
	var m:int;
	/*
	if(Input.touchCount<3)return false;
	
	if(
		(Input.GetTouch(0).phase==TouchPhase.Began || Input.GetTouch(0).phase==TouchPhase.Moved || Input.GetTouch(0).phase==TouchPhase.Stationary)  &&
		(Input.GetTouch(1).phase==TouchPhase.Began || Input.GetTouch(1).phase==TouchPhase.Moved || Input.GetTouch(0).phase==TouchPhase.Stationary) &&
		(Input.GetTouch(2).phase==TouchPhase.Began || Input.GetTouch(2).phase==TouchPhase.Moved || Input.GetTouch(0).phase==TouchPhase.Stationary)
	){
	
	}else{
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
				var cldr:Collider=fingers[j].collider;
				var ret:boolean=cldr.Raycast(ray, hit, 10000);
				if(ret){
					m|=1<<j;
				}
			}
		}
		return m==7;
	}else{
		return true;
	}//*/
	
	
	
	
	if(Input.touchCount<3)return false;
	
	for(i=0;i<Input.touchCount;i++){
		t=Input.GetTouch(i);
		if(t.phase==TouchPhase.Began || t.phase==TouchPhase.Moved || t.phase==TouchPhase.Stationary) {
			m++;
		}
	}
	if(m<fingerIds.Length)return false;
	
	return true;
	
	
	if(useFixGesture){
	
	
	
	}else{
		for(i=0;i<fingerIds.Length;i++){
			fingerIds[i]=Input.GetTouch(i).fingerId;
		}
		return true;
	}
	
}


function CheckGestureEnd():boolean{
	return Input.touchCount<fingerIds.Length;
	
	var i:int;
	var t:Touch;
	for(i=0;i<fingerIds.Length;i++){
		if(GetTouchById(fingerIds[i])){
			t=gettouch;
			if(!(t.phase==TouchPhase.Began || t.phase==TouchPhase.Moved || t.phase==TouchPhase.Stationary)){
				ResetFingerIds();
				return true;
			}
		}else{
			ResetFingerIds();
			return true;
		}
	}
	return false;
}

private function ResetFingerIds(){
	var i:int;
	for(i=0;i<fingerIds.Length;i++){
		fingerIds[i]=-1;
	}
}

private var gettouch:Touch;
private function GetTouchById(id:int):boolean{
	var i:int;
	for(i=0;i<Input.touchCount;i++){
		if(Input.GetTouch(i).fingerId==id){
			gettouch = Input.GetTouch(i);
			return true;
		}
	}
	return false;
}
function Start () {
	fingerIds=new int[fingers.Length];
	fingerTouches=new Touch[fingers.Length];
}


function _Update () {
	if(gesturePhase==0||gesturePhase==3){
		if(CheckGestureBegin()){
			gesturePhase=1;
			GetGestureInfo();
		}
	}else if(gesturePhase==1||gesturePhase==2){
		if(CheckGestureEnd()){
			gesturePhase=3;
		}else if(gesturePhase==1){
			gesturePhase=2;
			GetGestureInfo();
		}else if(gesturePhase==2){
			GetGestureInfo();
		}
	}
}

function Update(){
	if(useUpdateOrFixedUpdate)_Update();
}
function FixedUpdate(){
	if(!useUpdateOrFixedUpdate)_Update();
}

function OnDrawGizmos() {
	
}