// Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import MediaRecording from '../../src/mediarecording/MediaRecording';

export default class MediaRecordingMock implements MediaRecording {
  private listeners = new Map<string, Set<EventListener>>();

  start(_timeSliceMs: number): void {}

  stop(): Promise<void> {
    return Promise.resolve();
  }

  addEventListener(type: string, listener: EventListener): void {
    if (!this.listeners.get(type)) {
      this.listeners.set(type, new Set<EventListener>());
    }
    this.listeners.get(type).add(listener);
  }

  removeEventListener(type: string, listener: EventListener): void {
    if (this.listeners.get(type)) {
      this.listeners.get(type).delete(listener);
    }
  }
  dispatchEvent(event: Event): boolean {
    if (this.listeners.get(event.type)) {
      this.listeners.get(event.type).forEach((listener: EventListener) => {
        listener(event);
      });
    }
    return event.defaultPrevented;
  }
}
