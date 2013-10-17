#pragma strict

private var watertilesprites:tk2dSprite[];
private var watertilecurrspriteid:int[];
private var spriteids:int[];

var gameCamera:Camera;
var watertilePrefab:GameObject;
var rownum:int=15;
var colnum:int=12;
var changeduration:float=0.1;
var spriteWidth:float=75;
var spriteHeight:float=75;
var tilingtimeout:float=0.1;

var tileScale:float=4.0;

var spriteName:String="sea";
var spriteIdFrom:int=0;
var spriteIdTo:int=8;

private var sw:float;
private var sh:float;
private var lastchangetime:float;
private var lasttilingtime:float;
private var lwb:Vector3;
private var upb:Vector3;

function Start () {
	colnum*=tileScale;
	rownum*=tileScale;
	spriteWidth/=tileScale;
	spriteHeight/=tileScale;
	


	sw=Screen.width;
	sh=Screen.height;

	var i:int; var j:int;
	var sp:tk2dSprite;
	var spid:int;
	spriteids=new int[spriteIdTo-spriteIdFrom];
	for(i = 0 ; i < spriteids.Length ; i++)
		spriteids[i]=watertilePrefab.GetComponent(tk2dBaseSprite).GetSpriteIdByName(spriteName + "/" + (spriteIdFrom + i));
	
	watertilesprites=new tk2dSprite[rownum*colnum];
	watertilecurrspriteid=new int[rownum*colnum];
	for(i = 0 ; i < rownum ; i++) {
		for(j = 0 ; j < colnum ; j++) {
			var watertile:GameObject = GameObject.Instantiate(watertilePrefab);
			watertile.transform.parent=transform;
			watertile.transform.localPosition.x=-spriteWidth*colnum/2+j*spriteWidth;
			watertile.transform.localPosition.y=-spriteHeight*rownum/2+i*spriteHeight;
			watertile.transform.localPosition.z=0;
			sp=watertile.GetComponent(tk2dSprite);
			watertilesprites[j+colnum*i]=sp;
			spid=watertilecurrspriteid[j+colnum*i]=Random.Range(0, spriteids.Length);
			sp.SetSprite(spriteids[spid]);
			
			sp.scale=Vector3.one/tileScale;
		}
	}
	
}

function Update () {
	var i:int;
	var j:int;
	var sp:tk2dSprite;
	var spid:int;
	
	if(Time.time-lastchangetime>changeduration){
	
		for(i = 0 ; i < rownum ; i++) {
			for(j = 0 ; j < colnum ; j++) {
				sp=watertilesprites[j+colnum*i];
				spid=watertilecurrspriteid[j+colnum*i];
				
				spid=(spid+1)%spriteids.Length;
				watertilecurrspriteid[j+colnum*i]=spid;
								
				sp.SetSprite(spriteids[spid]);
			}
		}
		lastchangetime=Time.time;
	}
	
	if(Time.time-lasttilingtime>tilingtimeout){
		lwb=Vector3.zero;
		lwb=gameCamera.ScreenToWorldPoint(lwb);
		lwb.z=0;
		
		upb=new Vector3(sw,sh,0);
		upb=gameCamera.ScreenToWorldPoint(upb);
		upb.z=0;
		
		var left:float=Mathf.Min(lwb.x,upb.x);
		var right:float=Mathf.Max(lwb.x,upb.x);
		var up:float=Mathf.Max(lwb.y,upb.y);
		var down:float=Mathf.Min(lwb.y,upb.y);
		
		for(i = 0 ; i < rownum ; i++) {
			for(j = 0 ; j < colnum ; j++) {
				sp=watertilesprites[j+colnum*i];
				if(left-spriteWidth>sp.transform.position.x) sp.transform.localPosition.x+=colnum*spriteWidth;
				else if(right+spriteWidth<sp.transform.position.x) sp.transform.localPosition.x-=colnum*spriteWidth;
				if(up+spriteWidth<sp.transform.position.y) sp.transform.localPosition.y-=rownum*spriteHeight;
				else if(down-spriteWidth>sp.transform.position.y) sp.transform.localPosition.y+=rownum*spriteHeight;
			}
		}
		
		lasttilingtime=Time.time;
	}
}