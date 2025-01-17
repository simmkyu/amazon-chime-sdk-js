// Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as chai from 'chai';

import AudioVideoControllerState from '../../src/audiovideocontroller/AudioVideoControllerState';
import NoOpAudioVideoController from '../../src/audiovideocontroller/NoOpAudioVideoController';
import DefaultBrowserBehavior from '../../src/browserbehavior/DefaultBrowserBehavior';
import MeetingSessionConfiguration from '../../src/meetingsession/MeetingSessionConfiguration';
import MeetingSessionStatusCode from '../../src/meetingsession/MeetingSessionStatusCode';
import MeetingSessionTURNCredentials from '../../src/meetingsession/MeetingSessionTURNCredentials';
import AsyncScheduler from '../../src/scheduler/AsyncScheduler';
import TimeoutScheduler from '../../src/scheduler/TimeoutScheduler';
import FinishGatheringICECandidatesTask from '../../src/task/FinishGatheringICECandidatesTask';
import Task from '../../src/task/Task';
import DOMMockBuilder from '../dommock/DOMMockBuilder';
import SDPMock from '../sdp/SDPMock';

describe('FinishGatheringICECandidatesTask', () => {
  const expect: Chai.ExpectStatic = chai.expect;
  const iceEventName = 'icecandidate';

  let context: AudioVideoControllerState;
  let domMockBuilder: DOMMockBuilder | null = null;
  let task: Task;
  let testICEEvent: RTCPeerConnectionIceEvent;
  let turnCredentials: MeetingSessionTURNCredentials;

  function setUserAgent(userAgent: string): void {
    // @ts-ignore
    navigator.userAgent = userAgent;
  }

  function setUpPeerConnection(context: AudioVideoControllerState): void {
    const peer = context.peer;
    peer.addEventListener(iceEventName, (event: RTCPeerConnectionIceEvent) => {
      new AsyncScheduler().start(() => context.iceCandidateHandler(event));
    });
  }

  function makeTURNCredentials(): MeetingSessionTURNCredentials {
    const testCredentials = new MeetingSessionTURNCredentials();
    testCredentials.username = 'fakeUsername';
    testCredentials.password = 'fakeTURNCredentials';
    testCredentials.ttl = Infinity;
    testCredentials.uris = ['fakeUDPURI', 'fakeTCPURI'];
    return testCredentials;
  }

  function makeICEEvent(candidateStr: string | null): RTCPeerConnectionIceEvent {
    let iceCandidate: RTCIceCandidate = null;
    if (candidateStr) {
      // @ts-ignore
      iceCandidate = { candidate: candidateStr };
    }
    const iceEventInit: RTCPeerConnectionIceEventInit = {
      candidate: iceCandidate,
      url: 'test-foo-url',
    };
    return new RTCPeerConnectionIceEvent(iceEventName, iceEventInit);
  }

  function setLocalDescription(peer: RTCPeerConnection, sdp: string): void {
    // @ts-ignore
    peer.localDescription = new RTCSessionDescription({
      sdp,
      type: 'offer',
    });
  }

  before(() => {
    turnCredentials = makeTURNCredentials();
  });

  beforeEach(() => {
    domMockBuilder = new DOMMockBuilder();
    context = new AudioVideoControllerState();
    context.audioVideoController = new NoOpAudioVideoController();
    context.logger = context.audioVideoController.logger;
    const configuration = new MeetingSessionConfiguration();
    configuration.connectionTimeoutMs = 15000;
    context.meetingSessionConfiguration = configuration;
    const peer: RTCPeerConnection = new RTCPeerConnection();
    context.peer = peer;
    context.turnCredentials = turnCredentials;
    context.browserBehavior = new DefaultBrowserBehavior();
    setUpPeerConnection(context);
    task = new FinishGatheringICECandidatesTask(context);
  });

  afterEach(() => {
    if (domMockBuilder) {
      domMockBuilder.cleanup();
      domMockBuilder = null;
    }
  });

  describe('construction', () => {
    it('can be constructed', () => {
      expect(task).to.not.equal(null);
    });
  });

  describe('run', () => {
    it('can be run and succeed with one rtp candidate', done => {
      const peer = context.peer;
      setLocalDescription(peer, SDPMock.LOCAL_OFFER_WITHOUT_CANDIDATE);
      testICEEvent = makeICEEvent(SDPMock.RTP_CANDIDATE);
      task.run().then(() => {
        const candidates = context.iceCandidates;
        expect(candidates.length).to.be.equal(1);
        done();
      });
      new AsyncScheduler().start(() => peer.dispatchEvent(testICEEvent));
    });

    it('can be run and succeed with multiple events and rtp candidate', done => {
      const peer = context.peer;
      setLocalDescription(peer, SDPMock.LOCAL_OFFER_WITHOUT_CANDIDATE);
      testICEEvent = makeICEEvent(null);
      context.iceCandidates.push(testICEEvent.candidate);
      task.run().then(() => {
        const candidates = context.iceCandidates;
        expect(candidates.length).to.be.equal(1);
        done();
      });
      new AsyncScheduler().start(() => peer.dispatchEvent(testICEEvent));
      new AsyncScheduler().start(() => peer.dispatchEvent(testICEEvent));
    });

    it('can be run and succeed when the SDP has candidates for all m-lines', done => {
      const peer = context.peer;
      setLocalDescription(peer, SDPMock.MOZILLA_AV_SENDING);
      testICEEvent = makeICEEvent(null);
      context.iceCandidates.push(testICEEvent.candidate);
      task.run().then(() => {
        const candidates = context.iceCandidates;
        expect(candidates.length).to.be.equal(1);
        done();
      });
    });

    it('can be run and succeed in Safari when iceGatheringState is already comlete', done => {
      setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.2 Safari/605.1.15'
      );
      context.browserBehavior = new DefaultBrowserBehavior();
      const peer = context.peer;
      // @ts-ignore
      peer.iceGatheringState = 'complete';

      setLocalDescription(peer, SDPMock.LOCAL_OFFER_WITHOUT_CANDIDATE);
      task.run().then(() => {
        done();
      });
    });

    it('throws error with ice-candidate events but no RTP-type candidate', done => {
      const peer = context.peer;
      setLocalDescription(peer, SDPMock.LOCAL_OFFER_WITHOUT_CANDIDATE);
      testICEEvent = makeICEEvent('non-rtp-candidate');
      task.run().catch(() => {
        const candidates = context.iceCandidates;
        expect(candidates.length).to.be.equal(0);
        expect(peer.iceGatheringState).to.be.equal('complete');
        done();
      });
      new AsyncScheduler().start(() => peer.dispatchEvent(testICEEvent));
      new TimeoutScheduler(20).start(() => peer.dispatchEvent(testICEEvent));
    });

    it('throws error with ice candidate event but no candidate', done => {
      const peer = context.peer;
      setLocalDescription(peer, SDPMock.LOCAL_OFFER_WITHOUT_CANDIDATE);
      testICEEvent = makeICEEvent(null);
      task.run().catch(() => {
        const candidates = context.iceCandidates;
        expect(candidates.length).to.be.equal(0);
        expect(peer.iceGatheringState).to.be.equal('complete');
        done();
      });
      new AsyncScheduler().start(() => peer.dispatchEvent(testICEEvent));
      new TimeoutScheduler(20).start(() => peer.dispatchEvent(testICEEvent));
    });

    it('throws error when peer connection is null', done => {
      context.peer = null;
      task.run().catch(() => done());
    });
  });

  describe('cancel', () => {
    it('will not finish if passing the non-RTP-candidate until it it canceled', done => {
      const peer = context.peer;
      setLocalDescription(peer, SDPMock.LOCAL_OFFER_WITHOUT_CANDIDATE);
      task
        .run()
        .then(() => {
          done(new Error('This line should not be reached.'));
        })
        .catch(() => {
          done();
        });
      new TimeoutScheduler(20).start(() => {
        task.cancel();
      });
    });

    it('will not finish if passing the non-RTP-candidate until it it canceled', done => {
      const peer = context.peer;
      setLocalDescription(peer, SDPMock.LOCAL_OFFER_WITHOUT_CANDIDATE);
      task
        .run()
        .then(() => {
          done(new Error('This line should not be reached.'));
        })
        .catch(() => {
          done();
        });
      new TimeoutScheduler(20).start(() => {
        context.peer = null;
        task.cancel();
      });
    });

    it('will throw an error with ICEGatheringTimeoutWorkaround in Chrome when timed out', done => {
      task = new FinishGatheringICECandidatesTask(context, 0);
      setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.50 Safari/537.36'
      );
      context.browserBehavior = new DefaultBrowserBehavior();
      const peer = context.peer;
      setLocalDescription(peer, SDPMock.LOCAL_OFFER_WITHOUT_CANDIDATE);
      task.run().catch((error: Error) => {
        expect(error.message).includes(
          `the meeting status code: ${MeetingSessionStatusCode.ICEGatheringTimeoutWorkaround}`
        );
        done();
      });
      new TimeoutScheduler(20).start(() => {
        task.cancel();
      });
    });

    it("will throw an error without ICEGatheringTimeoutWorkaround in Chrome if connectionTimeoutMs is less than the task's Chrome VPN timeout value", done => {
      task = new FinishGatheringICECandidatesTask(
        context,
        context.meetingSessionConfiguration.connectionTimeoutMs + 100
      );
      setUserAgent('Chrome/77.0.3865.75');
      context.browserBehavior = new DefaultBrowserBehavior();
      const peer = context.peer;
      setLocalDescription(peer, SDPMock.LOCAL_OFFER_WITHOUT_CANDIDATE);
      task.run().catch((error: Error) => {
        expect(error.message).not.includes(
          `the meeting status code: ${MeetingSessionStatusCode.ICEGatheringTimeoutWorkaround}`
        );
        done();
      });
      new TimeoutScheduler(20).start(() => {
        task.cancel();
      });
    });

    it('will throw an error without ICEGatheringTimeoutWorkaround in Chrome if not timed out', done => {
      task = new FinishGatheringICECandidatesTask(context, 100);
      setUserAgent('Chrome/77.0.3865.75');
      context.browserBehavior = new DefaultBrowserBehavior();
      const peer = context.peer;
      setLocalDescription(peer, SDPMock.LOCAL_OFFER_WITHOUT_CANDIDATE);
      task.run().catch((error: Error) => {
        expect(error.message).not.includes(
          `the meeting status code: ${MeetingSessionStatusCode.ICEGatheringTimeoutWorkaround}`
        );
        done();
      });
      new TimeoutScheduler(20).start(() => {
        task.cancel();
      });
    });
  });
});
