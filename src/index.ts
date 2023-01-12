/*
   Copyright 2022 JavaScript Squad <javascript-dev-squad@vmminfra.net>

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
	File Name: index.ts
	Description: The main export point for this package.
	Written by: JavaScript Squad
*/

import CircuitBreakerBase from './sentinels/base/circuit_breaker_base';
import TripReasonAuthorityBase from './sentinels/base/trip_reason_authority_base';
import CircuitBreakerPolicyBase from './sentinels/base/circuit_breaker_policy_base';
import ExecutionCircuitBreakerBase, { Action, AsyncAction } from './sentinels/base/execution_circuit_breaker_base';

import CircuitBreaker from './sentinels/circuit_breakers/circuit_breaker';
import ExecutionCircuitBreaker, {
  FailureDetector,
  RetryIntervalCalculator,
} from './sentinels/circuit_breakers/execution_circuit_breaker';
import ThresholdExecutionCircuitBreaker, {
  ErrorCountGetter,
  ErrorIntervalGetter,
} from './sentinels/circuit_breakers/threshold_execution_circuit_breaker';

export { Jitter } from './sentinels/enums/jitter';
export { CircuitBreakerError } from './sentinels/base/circuit_breaker_base';

import DefaultCircuitBreakerPolicy from './sentinels/policy/default_circuit_breaker_policy';
import DefaultCircuitBreakerPolicyConfig from './sentinels/policy/default_circuit_breaker_policy_config';

import TogglableServiceSentinel from './sentinels/sentinels/togglable_service_sentinel';
import ServiceSentinel, { HealthCheck, MonitorIntervalGetter } from './sentinels/sentinels/service_sentinel';

import ExponentialBackoff from './sentinels/exponential_backoff';

import ISentinel from './sentinels/interfaces/sentinel';
import ICircuitBreaker from './sentinels/interfaces/circuit_breaker';
import ITripReasonAuthority from './sentinels/interfaces/trip_reason_authority';
import ICircuitBreakerPolicy, {
  OnRequestToOpen,
  OnTerminatingRequest,
} from './sentinels/interfaces/circuit_breaker_policy';
import IDefaultCircuitBreakerPolicyConfig from './sentinels/interfaces/default_circuit_breaker_policy_config';

export {
  CircuitBreakerBase,
  CircuitBreakerPolicyBase,
  Action,
  AsyncAction,
  ExecutionCircuitBreakerBase,
  TripReasonAuthorityBase,
  CircuitBreaker,
  FailureDetector,
  RetryIntervalCalculator,
  ExecutionCircuitBreaker,
  ErrorCountGetter,
  ErrorIntervalGetter,
  ThresholdExecutionCircuitBreaker,
  DefaultCircuitBreakerPolicy,
  DefaultCircuitBreakerPolicyConfig,
  HealthCheck,
  MonitorIntervalGetter,
  ServiceSentinel,
  TogglableServiceSentinel,
  ExponentialBackoff,
  ISentinel,
  ICircuitBreaker,
  ITripReasonAuthority,
  OnRequestToOpen,
  OnTerminatingRequest,
  ICircuitBreakerPolicy,
  IDefaultCircuitBreakerPolicyConfig,
};
