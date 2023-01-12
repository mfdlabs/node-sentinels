/*
   Copyright 2022 Nikita Petko <petko@vmminfra.net>

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

/*
	File Name: service_sentinel.ts
	Description: Simple sentinel for a health check service.
	Written by: Nikita Petko
*/

import ISentinel from '../interfaces/sentinel';

/**
 * Represents a function to determine if the service is healthy.
 * @returns {boolean} True if the service is healthy, otherwise false.
 */
export type HealthCheck = () => boolean;

/**
 * Represents a function to get the monitor interval.
 * @returns {number} The monitor interval.
 */
export type MonitorIntervalGetter = () => number;

/**
 * Simple sentinel for a health check service.
 */
export default class ServiceSentinel implements ISentinel {
  /**
   * @internal This is a private member.
   */
  private readonly _healthCheck: HealthCheck;

  /**
   * The function to get the monitor interval.
   */
  protected readonly monitorIntervalGetter: MonitorIntervalGetter;

  /**
   * @internal This is a private member.
   */
  private _isDisposed: boolean;

  /**
   * @internal This is a private member.
   */
  private _isHealthy: boolean;

  /**
   * The timer that monitors the service.
   */
  protected monitorTimer: NodeJS.Timeout;

  /**
   * Construct a new instance of the ServiceSentinel class.
   * @param {HealthCheck} healthCheck The function to determine if the service is healthy.
   * @param {MonitorIntervalGetter} monitorIntervalGetter The function to get the monitor interval.
   * @param {boolean} isHealthy The initial health status.
   */
  public constructor(healthCheck: HealthCheck, monitorIntervalGetter: MonitorIntervalGetter, isHealthy: boolean) {
    if (healthCheck === undefined || healthCheck === null) {
      throw new Error('The healthCheck parameter is required.');
    }

    if (monitorIntervalGetter === undefined || monitorIntervalGetter === null) {
      throw new Error('The monitorIntervalGetter parameter is required.');
    }

    this._healthCheck = healthCheck;
    this.monitorIntervalGetter = monitorIntervalGetter;
    this._isDisposed = false;
    this._isHealthy = isHealthy;

    this.monitorTimer = setInterval(this.monitor.bind(this), this.monitorIntervalGetter());
  }

  /**
   * Monitor the service. Protected so that classes that use monitorTimer can put the argument in the callback.
   * @returns {void}
   */
  /* istanbul ignore next */
  protected monitor(): void {
    if (this._isDisposed) {
      return;
    }

    try {
      this._isHealthy = this._healthCheck();
    } catch (error) {
      this._isHealthy = false;
    }
  }

  /**
   * Get the health status of the service.
   * @returns {boolean} True if the service is healthy, otherwise false.
   */
  public get isHealthy(): boolean {
    return this._isHealthy;
  }

  /**
   * Dispose the sentinel.
   * @param {boolean} disposing True if disposing, otherwise false.
   */
  public dispose(disposing: boolean): void {
    if (this._isDisposed) {
      return;
    }

    if (disposing) {
      clearInterval(this.monitorTimer);
      this._isDisposed = true;
    }
  }
}
