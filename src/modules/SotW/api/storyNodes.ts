import {StoryNode} from "@/modules/SotW/model/SotwModel";

const storyNodes: StoryNode[] = [
    {nodeId: 's-prolog', type: "story", storyPartId: 'story-prolog', nodeStatus: "visited"},

    {nodeId: 's-u', type: "story", storyPartId: 'story-pochop', nodeStatus: "visited", minigameId: 'm-u'},
    {nodeId: 's-p', type: "story", storyPartId: 'story-password', nodeStatus: "visited", minigameId: 'm-p'},
    {nodeId: 's-a', type: "story", storyPartId: 'story-anagram', nodeStatus: "visited", minigameId: 'm-a'},
    {nodeId: 's-c', type: "story", storyPartId: 'story-dreamcatcher', nodeStatus: "visited", minigameId: 'm-c'},
    {nodeId: 's-b', type: "story", storyPartId: 'story-remedy', nodeStatus: "visited", minigameId: 'm-b'},
    {nodeId: 's-d', type: "story", storyPartId: 'story-drums', nodeStatus: "visited", minigameId: 'm-d'},
    {nodeId: 's-r', type: "story", storyPartId: 'story-rings', nodeStatus: "visited", minigameId: 'm-r'},
    {nodeId: 's-m', type: "story", storyPartId: 'story-totem', nodeStatus: "visited", minigameId: 'm-m'},
    {nodeId: 's-t', type: "story", storyPartId: 'story-tri-na-tri', nodeStatus: "visited", minigameId: 'm-t'},
    {nodeId: 's-z', type: "story", storyPartId: 'story-samani', nodeStatus: "visited", minigameId: 'm-z'},

    {nodeId: 's-epilog', type: "story", storyPartId: 'story-epilog', nodeStatus: "active"},
]

export default storyNodes
