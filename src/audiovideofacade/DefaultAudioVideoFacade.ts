// Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import ActiveSpeakerPolicy from '../activespeakerpolicy/ActiveSpeakerPolicy';
import AudioMixController from '../audiomixcontroller/AudioMixController';
import AudioVideoController from '../audiovideocontroller/AudioVideoController';
import AudioVideoFacade from '../audiovideofacade/AudioVideoFacade';
import AudioVideoObserver from '../audiovideoobserver/AudioVideoObserver';
import DeviceChangeObserver from '../devicechangeobserver/DeviceChangeObserver';
import Device from '../devicecontroller/Device';
import DeviceController from '../devicecontroller/DeviceController';
import DevicePermission from '../devicecontroller/DevicePermission';
import RealtimeController from '../realtimecontroller/RealtimeController';
import VideoTile from '../videotile/VideoTile';
import VideoTileController from '../videotilecontroller/VideoTileController';

export default class DefaultAudioVideoFacade implements AudioVideoFacade {
  constructor(
    private audioVideoController: AudioVideoController,
    private videoTileController: VideoTileController,
    private realtimeController: RealtimeController,
    private audioMixController: AudioMixController,
    private deviceController: DeviceController
  ) {}

  addObserver(observer: AudioVideoObserver): void {
    this.audioVideoController.addObserver(observer);
    this.trace('addObserver');
  }

  removeObserver(observer: AudioVideoObserver): void {
    this.audioVideoController.removeObserver(observer);
    this.trace('removeObserver');
  }

  start(): void {
    this.audioVideoController.start();
    this.trace('start');
  }

  stop(): void {
    this.audioVideoController.stop();
    this.trace('stop');
  }

  bindAudioElement(element: HTMLAudioElement): boolean {
    const result = this.audioMixController.bindAudioElement(element);
    this.trace('bindAudioElement', element.id, result);
    return result;
  }

  unbindAudioElement(): void {
    this.audioMixController.unbindAudioElement();
    this.trace('unbindAudioElement');
  }

  bindVideoElement(tileId: number, videoElement: HTMLVideoElement): void {
    this.videoTileController.bindVideoElement(tileId, videoElement);
    this.trace('bindVideoElement', { tileId: tileId, videoElementId: videoElement.id });
  }

  unbindVideoElement(tileId: number): void {
    this.videoTileController.unbindVideoElement(tileId);
    this.trace('unbindVideoElement', tileId);
  }

  startLocalVideoTile(): number {
    const result = this.videoTileController.startLocalVideoTile();
    this.trace('startLocalVideoTile', null, result);
    return result;
  }

  stopLocalVideoTile(): void {
    this.videoTileController.stopLocalVideoTile();
    this.trace('stopLocalVideoTile');
  }

  hasStartedLocalVideoTile(): boolean {
    const result = this.videoTileController.hasStartedLocalVideoTile();
    this.trace('hasStartedLocalVideoTile', null, result);
    return result;
  }

  removeLocalVideoTile(): void {
    this.videoTileController.removeLocalVideoTile();
    this.trace('removeLocalVideoTile');
  }

  getLocalVideoTile(): VideoTile | null {
    const result = this.videoTileController.getLocalVideoTile();
    this.trace('getLocalVideoTile');
    return result;
  }

  pauseVideoTile(tileId: number): void {
    this.videoTileController.pauseVideoTile(tileId);
    this.trace('pauseVideoTile', tileId);
  }

  unpauseVideoTile(tileId: number): void {
    this.videoTileController.unpauseVideoTile(tileId);
    this.trace('unpauseVideoTile', tileId);
  }

  getVideoTile(tileId: number): VideoTile | null {
    const result = this.videoTileController.getVideoTile(tileId);
    this.trace('getVideoTile', tileId);
    return result;
  }

  getAllRemoteVideoTiles(): VideoTile[] {
    const result = this.videoTileController.getAllRemoteVideoTiles();
    this.trace('getAllRemoteVideoTiles');
    return result;
  }

  getAllVideoTiles(): VideoTile[] {
    const result = this.videoTileController.getAllVideoTiles();
    this.trace('getAllVideoTiles');
    return result;
  }

  addVideoTile(): VideoTile {
    const result = this.videoTileController.addVideoTile();
    this.trace('addVideoTile', null, result.state());
    return result;
  }

  removeVideoTile(tileId: number): void {
    this.videoTileController.removeVideoTile(tileId);
    this.trace('removeVideoTile', tileId);
  }

  removeVideoTilesByAttendeeId(attendeeId: string): number[] {
    const result = this.videoTileController.removeVideoTilesByAttendeeId(attendeeId);
    this.trace('removeVideoTilesByAttendeeId', attendeeId, result);
    return result;
  }

  removeAllVideoTiles(): void {
    this.videoTileController.removeAllVideoTiles();
    this.trace('removeAllVideoTiles');
  }

  captureVideoTile(tileId: number): ImageData | null {
    const result = this.videoTileController.captureVideoTile(tileId);
    this.trace('captureVideoTile', tileId);
    return result;
  }

  realtimeSubscribeToAttendeeIdPresence(
    callback: (attendeeId: string, present: boolean) => void
  ): void {
    this.realtimeController.realtimeSubscribeToAttendeeIdPresence(callback);
    this.trace('realtimeSubscribeToAttendeeIdPresence');
  }

  realtimeUnsubscribeToAttendeeIdPresence(
    callback: (attendeeId: string, present: boolean) => void
  ): void {
    this.realtimeController.realtimeUnsubscribeToAttendeeIdPresence(callback);
    this.trace('realtimeUnsubscribeToAttendeeIdPresence');
  }

  realtimeSetCanUnmuteLocalAudio(canUnmute: boolean): void {
    this.realtimeController.realtimeSetCanUnmuteLocalAudio(canUnmute);
    this.trace('realtimeSetCanUnmuteLocalAudio', canUnmute);
  }

  realtimeSubscribeToSetCanUnmuteLocalAudio(callback: (canUnmute: boolean) => void): void {
    this.realtimeController.realtimeSubscribeToSetCanUnmuteLocalAudio(callback);
    this.trace('realtimeSubscribeToSetCanUnmuteLocalAudio');
  }

  realtimeUnsubscribeToSetCanUnmuteLocalAudio(callback: (canUnmute: boolean) => void): void {
    this.realtimeController.realtimeUnsubscribeToSetCanUnmuteLocalAudio(callback);
  }

  realtimeCanUnmuteLocalAudio(): boolean {
    const result = this.realtimeController.realtimeCanUnmuteLocalAudio();
    this.trace('realtimeCanUnmuteLocalAudio', null, result);
    return result;
  }

  realtimeMuteLocalAudio(): void {
    this.realtimeController.realtimeMuteLocalAudio();
    this.trace('realtimeMuteLocalAudio');
  }

  realtimeUnmuteLocalAudio(): boolean {
    const result = this.realtimeController.realtimeUnmuteLocalAudio();
    this.trace('realtimeUnmuteLocalAudio');
    return result;
  }

  realtimeSubscribeToMuteAndUnmuteLocalAudio(callback: (muted: boolean) => void): void {
    this.realtimeController.realtimeSubscribeToMuteAndUnmuteLocalAudio(callback);
    this.trace('realtimeSubscribeToMuteAndUnmuteLocalAudio');
  }

  realtimeUnsubscribeToMuteAndUnmuteLocalAudio(callback: (muted: boolean) => void): void {
    this.realtimeController.realtimeUnsubscribeToMuteAndUnmuteLocalAudio(callback);
  }

  realtimeIsLocalAudioMuted(): boolean {
    const result = this.realtimeController.realtimeIsLocalAudioMuted();
    this.trace('realtimeIsLocalAudioMuted');
    return result;
  }

  realtimeSubscribeToVolumeIndicator(
    attendeeId: string,
    callback: (
      attendeeId: string,
      volume: number | null,
      muted: boolean | null,
      signalStrength: number | null
    ) => void
  ): void {
    this.realtimeController.realtimeSubscribeToVolumeIndicator(attendeeId, callback);
    this.trace('realtimeSubscribeToVolumeIndicator', attendeeId);
  }

  realtimeUnsubscribeFromVolumeIndicator(attendeeId: string): void {
    this.realtimeController.realtimeUnsubscribeFromVolumeIndicator(attendeeId);
    this.trace('realtimeUnsubscribeFromVolumeIndicator', attendeeId);
  }

  realtimeSubscribeToLocalSignalStrengthChange(callback: (signalStrength: number) => void): void {
    this.realtimeController.realtimeSubscribeToLocalSignalStrengthChange(callback);
    this.trace('realtimeSubscribeToLocalSignalStrengthChange');
  }

  realtimeUnsubscribeToLocalSignalStrengthChange(callback: (signalStrength: number) => void): void {
    this.realtimeController.realtimeUnsubscribeToLocalSignalStrengthChange(callback);
  }

  realtimeSubscribeToFatalError(callback: (error: Error) => void): void {
    this.realtimeController.realtimeSubscribeToFatalError(callback);
  }

  realtimeUnsubscribeToFatalError(callback: (error: Error) => void): void {
    this.realtimeController.realtimeUnsubscribeToFatalError(callback);
  }

  subscribeToActiveSpeakerDetector(
    policy: ActiveSpeakerPolicy,
    callback: (activeSpeakers: string[]) => void,
    scoresCallback?: (scores: { [attendeeId: string]: number }) => void,
    scoresCallbackIntervalMs?: number
  ): void {
    this.audioVideoController.activeSpeakerDetector.subscribe(
      policy,
      callback,
      scoresCallback,
      scoresCallbackIntervalMs
    );
    this.trace('subscribeToActiveSpeakerDetector');
  }

  unsubscribeFromActiveSpeakerDetector(callback: (activeSpeakers: string[]) => void): void {
    this.audioVideoController.activeSpeakerDetector.unsubscribe(callback);
    this.trace('unsubscribeFromActiveSpeakerDetector');
  }

  async listAudioInputDevices(): Promise<MediaDeviceInfo[]> {
    const result = await this.deviceController.listAudioInputDevices();
    this.trace('listAudioInputDevices', null, result);
    return result;
  }

  async listVideoInputDevices(): Promise<MediaDeviceInfo[]> {
    const result = await this.deviceController.listVideoInputDevices();
    this.trace('listVideoInputDevices', null, result);
    return result;
  }

  async listAudioOutputDevices(): Promise<MediaDeviceInfo[]> {
    const result = await this.deviceController.listAudioOutputDevices();
    this.trace('listAudioOutputDevices', null, result);
    return result;
  }

  chooseAudioInputDevice(device: Device): Promise<DevicePermission> {
    const result = this.deviceController.chooseAudioInputDevice(device);
    this.trace('chooseAudioInputDevice', device);
    return result;
  }

  chooseVideoInputDevice(device: Device): Promise<DevicePermission> {
    const result = this.deviceController.chooseVideoInputDevice(device);
    this.trace('chooseVideoInputDevice', device);
    return result;
  }

  chooseAudioOutputDevice(deviceId: string | null): Promise<void> {
    const result = this.deviceController.chooseAudioOutputDevice(deviceId);
    this.trace('chooseAudioOutputDevice', deviceId);
    return result;
  }

  addDeviceChangeObserver(observer: DeviceChangeObserver): void {
    this.deviceController.addDeviceChangeObserver(observer);
    this.trace('addDeviceChangeObserver');
  }

  removeDeviceChangeObserver(observer: DeviceChangeObserver): void {
    this.deviceController.removeDeviceChangeObserver(observer);
    this.trace('removeDeviceChangeObserver');
  }

  createAnalyserNodeForAudioInput(): AnalyserNode | null {
    const result = this.deviceController.createAnalyserNodeForAudioInput();
    this.trace('createAnalyserNodeForAudioInput');
    return result;
  }

  startVideoPreviewForVideoInput(element: HTMLVideoElement): void {
    this.deviceController.startVideoPreviewForVideoInput(element);
    this.trace('startVideoPreviewForVideoInput', element.id);
  }

  stopVideoPreviewForVideoInput(element: HTMLVideoElement): void {
    this.deviceController.stopVideoPreviewForVideoInput(element);
    this.trace('stopVideoPreviewForVideoInput', element.id);
  }

  setDeviceLabelTrigger(trigger: () => Promise<MediaStream>): void {
    this.deviceController.setDeviceLabelTrigger(trigger);
    this.trace('setDeviceLabelTrigger');
  }

  mixIntoAudioInput(stream: MediaStream): MediaStreamAudioSourceNode {
    const result = this.deviceController.mixIntoAudioInput(stream);
    this.trace('mixIntoAudioInput', stream.id);
    return result;
  }

  chooseVideoInputQuality(
    width: number,
    height: number,
    frameRate: number,
    maxBandwidthKbps: number
  ): void {
    this.deviceController.chooseVideoInputQuality(width, height, frameRate, maxBandwidthKbps);
    this.trace('chooseVideoInputQuality', {
      width: width,
      height: height,
      frameRate: frameRate,
      maxBandwidthKbps: maxBandwidthKbps,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private trace(name: string, input?: any, output?: any): void {
    let s = `API/DefaultAudioVideoFacade/${name}`;
    if (typeof input !== 'undefined') {
      s += ` ${JSON.stringify(input)}`;
    }
    if (typeof output !== 'undefined') {
      s += ` -> ${JSON.stringify(output)}`;
    }
    this.audioVideoController.logger.info(s);
  }
}
