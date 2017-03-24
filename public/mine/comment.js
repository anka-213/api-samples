// Sample JavaScript code for printing API response data

function executeRequest(request) {
  request.execute(function(response) {
    printResults(response);
    displayResult(response);
  });
}

function printResults(response) {
  var props = ['type', 'title', 'textDisplay', 'channelId', 'videoId', 'hl', 'gl', 'label'];
  for (var r = 0; r < response['items'].length; r++) {
    var item = response['items'][r];
    var itemId = '';
    var value;
    if (item['rating']) {
      itemId = item['id'];
      value = 'Rating: ' + item['rating'];
    } else {
      if (item['id']['videoId']) {
        itemId = item['id']['videoId'];
      } else if (item['id']['channelId']) {
        itemId = item['id']['channelId'];
      } else {
        itemId = item['id'];
      }

      for (var p = 0; p < props.length; p++) {
        if (item['snippet'][props[p]]) {
          value = itemId + ': ' + item['snippet'][props[p]];
          break;
        }
      }
    }
    console.log(value);
  }
}
  

// Sample JavaScript code for user authorization

/**
 * This Google APIs JS client automatically invokes this callback function after loading.
 */
googleApiClientReady = function() {
  gapi.auth.init(function() {
    window.setTimeout(checkAuth, 1);
  });
}

/**
 * This function attempts the immediate OAuth 2.0 client flow as soon as the
 * page loads. If the currently logged-in Google Account has previously
 * authorized the client specified as the OAUTH2_CLIENT_ID, then the
 * authorization succeeds with no user intervention. Otherwise, it fails and
 * the user interface that prompts for authorization needs to display.
 */
function checkAuth() {
  gapi.auth.authorize({
    client_id: '367177201592-49i42tkiugohglnaia2dvifkceno9bud.apps.googleusercontent.com',
    scope: ['https://www.googleapis.com/auth/youtube.force-ssl',
            'https://www.googleapis.com/auth/youtubepartner'],
    immediate: true
  }, handleAuthResult);
}

/**
 * This function handles the result of a gapi.auth.authorize() call.
 * @param {Object} authResult The result object returned by the gapi.auth.authorize() call.
 */
function handleAuthResult(authResult) {
  if (authResult && !authResult.error) {
    // Authorization was successful. Hide authorization prompts and show
    // content that should be visible after authorization succeeds.
    $('.pre-auth').hide();
    $('.post-auth').show();
    loadAPIClientInterfaces();
  } else {
    // Make the #login-link clickable. Attempt a non-immediate OAuth 2.0
    // client flow. The current function is called when that flow completes.
    $('#auth-button').click(function() {
      gapi.auth.authorize({
        client_id: '367177201592-49i42tkiugohglnaia2dvifkceno9bud.apps.googleusercontent.com',
        scope: ['https://www.googleapis.com/auth/youtube.force-ssl',
                'https://www.googleapis.com/auth/youtubepartner'],
        immediate: false
        }, handleAuthResult);
    });
  }
}

/**
 * This function loads the client interface for the API specified in the
 * config data. For more information, see:
 * https://developers.google.com/api-client-library/javascript/reference/referencedocs
 */
function loadAPIClientInterfaces() {
  gapi.client.load('youtube', 'v3', function() {
    // Code to execute when API client interface is loaded. To test functions,
    // you could automatically call an API function after loading the interface.
    // Here, the makeApiCalls() function is being called. This function is
    // in the sample code if you select 'Show all snippets' for JavaScript.
    makeApiCalls();
  });
}

function getIds(response){
  /*
  {
 "kind": "youtube#commentListResponse",
 "etag": "\"uQc-MPTsstrHkQcRXL3IWLmeNsM/y8Wdl16BSoYniJOnauWZd_IPWxI\"",
 "items": [
  {
   "kind": "youtube#comment",
   "etag": "\"uQc-MPTsstrHkQcRXL3IWLmeNsM/EPhk693DL-BDchiKCm0gn0sO28g\"",
   "id": "z22hwhpamlydu3xgs04t1aokgc55dt4d5hehastlfs25rk0h00410",
   "snippet": {
    "authorDisplayName": "thefateshavewarned",
    "authorProfileImageUrl": "https://yt3.ggpht.com/-_ppr29VHX-A/AAAAAAAAAAI/AAAAAAAAAAA/aBGwsyqsA2M/s28-c-k-no-mo-rj-c0xffffff/photo.jpg",
    "authorChannelUrl": "http://www.youtube.com/channel/UC61PIXDbZkSYMiaUVSp9M-g",
    "authorChannelId": {
     "value": "UC61PIXDbZkSYMiaUVSp9M-g"
    },
    "textDisplay": "Twn Trwn has taken the mantle of worst robot from Piece de Resistance.",
    "textOriginal": "Twn Trwn has taken the mantle of worst robot from Piece de Resistance.",
    "canRate": true,
    "viewerRating": "none",
    "likeCount": 0,
    "publishedAt": "2011-09-17T15:40:11.000Z",
    "updatedAt": "2011-09-17T15:40:11.000Z"
   }
  }
 ]
}
*/
}

// Given an array of GRequests, returns a promise for an array of the responses
function batchMap(arr,fun=null) {
  var batch = gapi.client.newBatch();
  if (fun) {
    arr = arr.map(fun);
  }
  for (let i = 0; i < arr.length; i++) {
    batch.add(arr[i], {id:""+i});
  }
  return batch.then(x=>Object.values(x.result));
}

// Create a listing for a video.
function displayResult(commentSnippet, container="comment-container") {
  var id = commentSnippet.id;
  commentSnippet = commentSnippet.snippet;
  var name = commentSnippet.authorDisplayName;
  var img = commentSnippet.authorProfileImageUrl;
  var text = commentSnippet.textDisplay;
  var date = commentSnippet.publishedAt;
  var likes = commentSnippet.likeCount;
  $('#'+container).append(`<div id="${id}" class="comment"><p><img src="${img}"/> ${name} (${likes}): ${text}</p></div>`);
}

Object.defineProperties(Array.prototype, {
    'flatMap': {
        value: function (lambda) {
            return Array.prototype.concat.apply([], this.map(lambda));
        },
        writeable: false,
        enumerable: false
    }
});

function displayResults(snippets) {
  console.log(snippets);
  snippets = snippets.flatMap(x=>x.result.items);
  snippets.forEach(x=>displayResult(x));
}

function displayReplies(snippets) {
  console.log(snippets);
  snippets.forEach(function(thread){
    var threadId = thread.id;
    var replies = thread.replies.comments;
    replies.forEach(reply=>displayResult(reply,threadId))
    
  });
}

function makeApiCalls(){
  var videoId ='t1nKkBvv68g';
  
  //commentsList('snippet', 'z13icrq45mzjfvkpv04ce54gbnjgvroojf0');
  var commentIds = commentThreadsListByVideoId('id', videoId).then(x=>x.result.items.map(y=>y.id));
  var comments = commentIds.then(getComments);
  var displayed = comments.then(displayResults);
  var replies = displayed.then(()=>getReplies(videoId));
  replies.then(displayReplies);
  //commentIds.then(showComments, console.error);

}

function getComments(ids) {
  return batchMap(ids,getComment);
}

function getReplies(videoId) {
  return commentThreadsListByVideoId('replies', videoId)
    .then(x=>x.result.items.filter(thread=>"replies" in thread));
}

function getComment(id) {
  return gapi.client.youtube.comments.list(
      {id: id,
       part: "snippet"});
}



// Sample js code for commentThreads.list

function commentThreadsListByVideoId(part, videoId) {
  var request = gapi.client.youtube.commentThreads.list(
      {part: part,
       videoId: videoId,
       maxResults: 100});
  return request;
  //executeRequest(request);
}


// Old


function showComments(commentIds) {
  console.log(commentIds);
  for (let commentId of commentIds) {
    commentsList('snippet',commentId);
  }
}


// Sample js code for comments.list

function commentsList(part, parentId) {
  var request = gapi.client.youtube.comments.list(
      {id: parentId,
       part: part});
  //return request;
  executeRequest(request);
}