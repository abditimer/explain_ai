export const initialNarrativeState = {
  sceneId: 'intro',
  beatId: 'intro.beat-01',
  requestedSceneId: null,
  requestedBeatId: null,
  transitionProgress: 0,
};

export const initialExperimentState = {
  selectedTokenId: null,
  selectedContinuationTokenId: null,
  temperature: 1,
  selectionMode: 'sample',
};

export function narrativeReducer(state, action) {
  switch (action.type) {
    case 'narrative/request':
      return {
        ...state,
        requestedSceneId: action.sceneId,
        requestedBeatId: action.beatId,
      };
    case 'narrative/restore':
      return {
        sceneId: action.sceneId,
        beatId: action.beatId,
        requestedSceneId: null,
        requestedBeatId: null,
        transitionProgress: 1,
      };
    case 'narrative/cancel-request':
      return { ...state, requestedSceneId: null, requestedBeatId: null };
    case 'narrative/seek':
      return {
        sceneId: action.sceneId,
        beatId: action.beatId,
        requestedSceneId: null,
        requestedBeatId: null,
        transitionProgress: Math.max(0, Math.min(1, action.transitionProgress ?? 0)),
      };
    case 'narrative/progress':
      if (action.beatId !== state.beatId) return state;
      return {
        ...state,
        transitionProgress: Math.max(0, Math.min(1, action.progress)),
      };
    default:
      return state;
  }
}

export function experimentReducer(state, action) {
  switch (action.type) {
    case 'experiment/select-token':
      return { ...state, selectedTokenId: action.tokenId };
    case 'experiment/select-continuation':
      return { ...state, selectedContinuationTokenId: action.tokenId };
    case 'experiment/set-temperature':
      return { ...state, temperature: Math.max(0.01, Math.min(5, action.temperature)) };
    case 'experiment/set-selection-mode':
      return { ...state, selectionMode: action.mode };
    default:
      return state;
  }
}
