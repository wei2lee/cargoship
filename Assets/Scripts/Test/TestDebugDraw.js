#pragma strict

function Start () {

}

function Update () {
	if(Input.GetKeyDown(KeyCode.A)){
		Debug.DrawRay(transform.position, new Vector3(0,10,0), Color.red, 2);
		Debug.DrawRay(transform.position, new Vector3(10,0,0), Color.red, 2);
		Debug.DrawRay(transform.position, new Vector3(0,0,10), Color.red, 2);
	}
}