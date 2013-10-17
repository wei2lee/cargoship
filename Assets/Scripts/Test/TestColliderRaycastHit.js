#pragma strict

var mycamera:Camera;

function Start () {

}

function Update () {
	if(Input.GetMouseButtonDown(0)){
		var ray:Ray=mycamera.ScreenPointToRay(Input.mousePosition);
		var hit:RaycastHit;
		if(this.collider.Raycast(ray, hit, 10000)){
			Debug.Log("hit "+name);
		}
	}
}