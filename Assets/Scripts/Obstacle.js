#pragma strict

static var MINE:int=1;
static var LOG:int=2;
static var WALL:int=3;

var type:int=0;

static var mineDeleteLife:float=50;
static var mineDeleteVelocityFactor:float=0.99;
static var mineScaleBounds:float[];
static var mineDragBounds:float[];
static var mineAngularDragBounds:float[];

static var logDeleteLife:float=0.0;
static var logDeleteVelocityFactor:float=0.05;
static var logScaleBounds:float[];
static var logDragBounds:float[];
static var logAngularDragBounds:float[];

static var wallDeleteLife:float=10;
static var wallDeleteVelocityFactor:float=0.50;


static var positionBounds:Vector3[];
static var rotationBounds:float[];

//static var logSpriteIds:int[];

static var init:boolean;
static var init2:boolean;

var lastHitPlayerTime:float;


var deleteLife:float=-1;
var deleteVelocityFactor=-1;
var scaleBounds:float[];
var dragBounds:float[];
var massBounds:float[];
var angularDragBounds:float[];
var spositionBounds:Vector3[];
var srotationBounds:float[];



function GetDeleteLife():float{
	if(deleteLife!=-1)return deleteLife;
	if(type==MINE)return mineDeleteLife;
	if(type==LOG)return logDeleteLife;
	if(type==WALL)return wallDeleteLife;
	return 0;
}
function GetDeleteVelocityFactor():float{
	if(deleteVelocityFactor!=-1)return deleteVelocityFactor;
	if(type==MINE)return mineDeleteVelocityFactor;
	if(type==LOG)return logDeleteVelocityFactor;
	if(type==WALL)return wallDeleteVelocityFactor;
	return 0;
}

function Awake() {
	var i:int;
	if(!init || !init2){
		if(!init && type==LOG){
			init=true;
			/*
			var sp:tk2dBaseSprite=GetComponent(tk2dBaseSprite);
			logSpriteIds=new int[24];
			logSpriteIds[0]=sp.GetSpriteIdByName("woods_"+"03");
			
			logSpriteIds[1]=sp.GetSpriteIdByName("woods_"+"31");
			logSpriteIds[2]=sp.GetSpriteIdByName("woods_"+"05");
			logSpriteIds[3]=sp.GetSpriteIdByName("woods_"+"08");
			logSpriteIds[4]=sp.GetSpriteIdByName("woods_"+"09");
			
			logSpriteIds[5]=sp.GetSpriteIdByName("woods_"+"11");
			logSpriteIds[6]=sp.GetSpriteIdByName("woods_"+"12");
			logSpriteIds[7]=sp.GetSpriteIdByName("woods_"+"13");
			logSpriteIds[8]=sp.GetSpriteIdByName("woods_"+"14");
			logSpriteIds[9]=sp.GetSpriteIdByName("woods_"+"15");
			
			logSpriteIds[10]=sp.GetSpriteIdByName("woods_"+"16");
			logSpriteIds[11]=sp.GetSpriteIdByName("woods_"+"17");
			logSpriteIds[12]=sp.GetSpriteIdByName("woods_"+"18");
			logSpriteIds[13]=sp.GetSpriteIdByName("woods_"+"19");
			logSpriteIds[14]=sp.GetSpriteIdByName("woods_"+"20");
			
			logSpriteIds[15]=sp.GetSpriteIdByName("woods_"+"21");
			logSpriteIds[16]=sp.GetSpriteIdByName("woods_"+"22");
			logSpriteIds[17]=sp.GetSpriteIdByName("woods_"+"23");
			logSpriteIds[18]=sp.GetSpriteIdByName("woods_"+"24");
			logSpriteIds[19]=sp.GetSpriteIdByName("woods_"+"25");
			
			logSpriteIds[20]=sp.GetSpriteIdByName("woods_"+"26");
			logSpriteIds[21]=sp.GetSpriteIdByName("woods_"+"28");
			logSpriteIds[22]=sp.GetSpriteIdByName("woods_"+"29");
			logSpriteIds[23]=sp.GetSpriteIdByName("woods_"+"30");
			//*/
			//for(i=0;i<logSpriteIds.Length;i++)Debug.Log(logSpriteIds[i]);
			//Debug.Log("logSpriteIds="+logSpriteIds);
			
		}
		
		if(!init2){
			init2=true;
			mineScaleBounds=new float[2];
			mineScaleBounds[0]=0.85;
			mineScaleBounds[1]=1.00;
			
			
			
			
			
			logScaleBounds=new float[2];
			logScaleBounds[0]=0.8;
			logScaleBounds[1]=1.2;
			
			
			positionBounds=new Vector3[2];
			positionBounds[0]=new Vector3(0, 0, 0);
			positionBounds[1]=new Vector3(0, 0, 0);
			
			rotationBounds=new float[2];
			rotationBounds[0]=0;
			rotationBounds[1]=0;
		}
	}
	
	var s:float;
	
	if(type==LOG){
		//this.GetComponent(tk2dBaseSprite).SetSprite(logSpriteIds[Random.Range(0,logSpriteIds.Length)]);
	}
	if(scaleBounds&&scaleBounds.Length>=2)s=Random.Range(scaleBounds[0],scaleBounds[1]);	
	else{
		if(type==LOG){
			s=Random.Range(logScaleBounds[0],logScaleBounds[1]);	
		}else if(type==MINE){
			s=Random.Range(mineScaleBounds[0],mineScaleBounds[1]);	
		}else if(type==WALL){
		}else{
			Debug.Log("Obstacle:unknown type:"+type);
		}
	}
	/*
	if(rigidbody){
		if(dragBounds&&dragBounds.Length>=2) rigidbody.drag=Random.Range(dragBounds[0], dragBounds[1]);
		if(massBounds&&massBounds.Length>=2) rigidbody.mass=Random.Range(massBounds[0], massBounds[1]);
		if(angularDragBounds&&angularDragBounds.Length>=2) rigidbody.angularDrag=Random.Range(angularDragBounds[0], angularDragBounds[1]);
	}	
	//*/
	if(type==LOG||type==MINE){
		this.transform.localScale=new Vector3(s,s,s);
	}
	
	if(type==LOG||type==MINE){
		if(srotationBounds&&srotationBounds.Length>=2)this.transform.localRotation=Quaternion.Euler(0,0,Random.Range(srotationBounds[0], srotationBounds[1]))*this.transform.localRotation;
		else this.transform.localRotation=Quaternion.Euler(0,0,Random.Range(rotationBounds[0], rotationBounds[1]))*this.transform.localRotation;
	}
	
	if(type==LOG){
		if(spositionBounds&&spositionBounds.Length>=2){
			this.transform.localPosition.x+=Random.Range(spositionBounds[0].x,spositionBounds[1].x);
			this.transform.localPosition.y+=Random.Range(spositionBounds[0].y,spositionBounds[1].y);
		}else{
			this.transform.localPosition.x+=Random.Range(positionBounds[0].x,positionBounds[1].x);
			this.transform.localPosition.y+=Random.Range(positionBounds[0].y,positionBounds[1].y);
		}
	}
}

function Start () {
}

function Update () {

}

function PlayAnim(s:String){
	if(s=="onplayerhit"){
		if(type==WALL){
		
		}else if(type==MINE){
			 renderer.enabled=false;
			 collider.enabled=false;
			 enabled=false;
			 var pss:ParticleSystem[]=GetComponentsInChildren.<ParticleSystem>(true);
			 //Debug.Log("pss.Length="+pss.Length);
			 for(var ps:ParticleSystem in pss) ps.gameObject.SetActive(true);
		}
	}
}