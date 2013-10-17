using UnityEngine;
using System.Collections;
using System.Collections.Generic;

[ExecuteInEditMode]

//-------------------------------------------------------------------------
/// <summary>
/// A class to provide compatibility of AlphaMeshColliders with SmoothMoves
/// sprites. There are some properties that we like to have synced between
/// the SmoothMoves and AlphaMeshCollider components.
/// </summary>
public class AlphaMeshColliderSmoothMovesRestore : MonoBehaviour {
	
	//-------------------------------------------------------------------------
	[System.Serializable]
	public class RestoreData {
		public bool mIsTrigger = false;
		public bool mConvex = false;
		public PhysicMaterial mSharedMaterial = null;
		public bool mSmoothSphereCollisions = false;
		public Mesh mColliderMesh = null;
	}
	//-------------------------------------------------------------------------
	
	public RestoreData[] mDataToRestore = null;
	public string[] mNodePaths = null;
	public bool[] mIsSmoothMovesScaleAnimAppliedAtNode = null;
	public bool mHasRestoredData = false;
	
	//-------------------------------------------------------------------------
	void Start () {
		mHasRestoredData = false;
	}
	
	//-------------------------------------------------------------------------
	void Update () {
#if UNITY_EDITOR
		if (Application.isEditor && !Application.isPlaying) {
			StoreColliderData();
		}
		else {
#endif
			if (!mHasRestoredData) {
				RestoreColliderData();
				mHasRestoredData = true;
			}
#if UNITY_EDITOR
		}
#endif
	}

#if UNITY_EDITOR
    //-------------------------------------------------------------------------
	protected void StoreColliderData() {
		List<AlphaMeshCollider> collidersList = new List<AlphaMeshCollider>();
		List<RestoreData> dataList = new List<RestoreData>();
		List<string> pathsList = new List<string>();
		List<bool> isScaleAnimNodeList = new List<bool>();
		
		AddChildColliderDataRecursively(this.transform, "", ref collidersList, ref dataList, ref pathsList, ref isScaleAnimNodeList);
		
		mDataToRestore = dataList.ToArray();
		mNodePaths = pathsList.ToArray();
		mIsSmoothMovesScaleAnimAppliedAtNode = isScaleAnimNodeList.ToArray();
	}
	
    //-------------------------------------------------------------------------
	protected void AddChildColliderDataRecursively(Transform node, string nodePath, ref List<AlphaMeshCollider> collidersList, ref List<RestoreData> dataList, ref List<string> pathsList, ref List<bool> isScaleAnimNodeList) {
		
		foreach (Transform child in node) {
			string childNodePath = (nodePath.Length == 0) ? child.name : nodePath + "/" + child.name;
			
			AlphaMeshCollider alphaMeshColliderComponent = child.GetComponent<AlphaMeshCollider>();
			if (alphaMeshColliderComponent != null) {
				
				MeshCollider meshCollider = alphaMeshColliderComponent.TargetNodeToAttachMeshCollider.gameObject.GetComponent<MeshCollider>();
				if (meshCollider != null) {
				
					string meshNodePath = childNodePath;
					bool isScaleAnimNode = alphaMeshColliderComponent.ApplySmoothMovesScaleAnim;
					if (isScaleAnimNode) {
						meshNodePath += "/" + alphaMeshColliderComponent.TargetNodeNameToAttachMeshCollider;
					}
					
					collidersList.Add(alphaMeshColliderComponent);
					RestoreData data = new RestoreData();
					
					data.mColliderMesh = meshCollider.sharedMesh;
					data.mIsTrigger = meshCollider.isTrigger;
					data.mConvex = meshCollider.convex;
					data.mSharedMaterial = meshCollider.sharedMaterial;
					data.mSmoothSphereCollisions = meshCollider.smoothSphereCollisions;
					
					dataList.Add(data);
					pathsList.Add(meshNodePath);
					isScaleAnimNodeList.Add(isScaleAnimNode);
				}
			}
			
			AddChildColliderDataRecursively(child, childNodePath, ref collidersList, ref dataList, ref pathsList, ref isScaleAnimNodeList);
		}
	}
#endif // UNITY_EDITOR

    //-------------------------------------------------------------------------
	protected void RestoreColliderData() {
		for (int index = 0; index < mDataToRestore.Length; ++index) {
			Transform restoreNode = this.transform.Find(mNodePaths[index]);
			
			MeshCollider collider = restoreNode.GetComponent<MeshCollider>();
			if (collider == null) {
				collider = restoreNode.gameObject.AddComponent<MeshCollider>();
			}
			collider.sharedMesh = null;
			RestoreData data = mDataToRestore[index];
			collider.sharedMesh = data.mColliderMesh;
			collider.isTrigger = data.mIsTrigger;
			collider.convex = data.mConvex;
			collider.sharedMaterial = data.mSharedMaterial;
			collider.smoothSphereCollisions = data.mSmoothSphereCollisions;
			
			Transform referenceColliderNode = restoreNode;
			bool parentHoldsReferenceCollider = mIsSmoothMovesScaleAnimAppliedAtNode[index];
			if (parentHoldsReferenceCollider) {
				referenceColliderNode = restoreNode.transform.parent;
			}
						
			bool hasSmoothMovesCollider = referenceColliderNode.GetComponent<BoxCollider>();
			if (!hasSmoothMovesCollider)
				hasSmoothMovesCollider = referenceColliderNode.GetComponent<SphereCollider>();
			
			if (hasSmoothMovesCollider) {
				// copy the SmoothMoves collider's enabled state at runtime.
				AlphaMeshColliderCopyColliderEnabled copyStateComponent = restoreNode.GetComponent<AlphaMeshColliderCopyColliderEnabled>();
				if (copyStateComponent == null) {
					copyStateComponent = restoreNode.gameObject.AddComponent<AlphaMeshColliderCopyColliderEnabled>();
				}
			}
		}
	}
}
