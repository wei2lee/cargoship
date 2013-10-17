#pragma strict

var followTarget:Transform;
var followDamping:float=10;
var useUpdateOrFixedUpdate:boolean=false;

function Start () {

}

function _Update () {
	if(!followTarget)return;
	this.transform.position=Vector3.Lerp(this.transform.position,new Vector3(followTarget.position.x,followTarget.position.y,transform.position.z),followDamping*Time.deltaTime);
}

function Update(){
	if(useUpdateOrFixedUpdate)_Update();
}
function FixedUpdate(){
	if(!useUpdateOrFixedUpdate)_Update();
}