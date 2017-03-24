// Define some variables used to remember state.
var playlistId, nextPageToken, prevPageToken;

// After the API loads, call a function to get the uploads playlist ID.
function handleAPILoaded() {
  listCommentThreads();
  requestUserUploadsPlaylistId();
}

//tmp
function executeRequest(request) {
  request.execute(function(response) {
    printResults(response);
  });
}

//tmp
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

function commentThreadsListByVideoId(part, videoId) {
  var request = gapi.client.youtube.commentThreads.list(
      {part: part,
       videoId: videoId});
  executeRequest(request);
}

// List comment threads
function listCommentThreads(){
// Sample js code for commentThreads.list


commentThreadsListByVideoId('id', 't1nKkBvv68g');
}

// Call the Data API to retrieve the playlist ID that uniquely identifies the
// list of videos uploaded to the currently authenticated user's channel.
function requestUserUploadsPlaylistId() {
  // See https://developers.google.com/youtube/v3/docs/channels/list
  var request = gapi.client.youtube.channels.list({
    mine: true,
    part: 'contentDetails'
  });
  request.execute(function(response) {
    playlistId = response.result.items[0].contentDetails.relatedPlaylists.uploads;
    requestVideoPlaylist(playlistId);
  });
}

// Retrieve the list of videos in the specified playlist.
function requestVideoPlaylist(playlistId, pageToken) {
  $('#video-container').html('');
  var requestOptions = {
    playlistId: playlistId,
    part: 'snippet',
    maxResults: 10
  };
  if (pageToken) {
    requestOptions.pageToken = pageToken;
  }
  var request = gapi.client.youtube.playlistItems.list(requestOptions);
  request.execute(function(response) {
    // Only show pagination buttons if there is a pagination token for the
    // next or previous page of results.
    nextPageToken = response.result.nextPageToken;
    var nextVis = nextPageToken ? 'visible' : 'hidden';
    $('#next-button').css('visibility', nextVis);
    prevPageToken = response.result.prevPageToken
    var prevVis = prevPageToken ? 'visible' : 'hidden';
    $('#prev-button').css('visibility', prevVis);

    var playlistItems = response.result.items;
    if (playlistItems) {
      $.each(playlistItems, function(index, item) {
        displayResult(item.snippet);
      });
    } else {
      $('#video-container').html('Sorry you have no uploaded videos');
    }
  });
}

// Create a listing for a video.
function displayResult(videoSnippet) {
  var title = videoSnippet.title;
  var videoId = videoSnippet.resourceId.videoId;
  $('#video-container').append('<p>' + title + ' - ' + videoId + '</p>');
}

// Retrieve the next page of videos in the playlist.
function nextPage() {
  requestVideoPlaylist(playlistId, nextPageToken);
}

// Retrieve the previous page of videos in the playlist.
function previousPage() {
  requestVideoPlaylist(playlistId, prevPageToken);
}
