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
	File Name: jitter.ts
	Description: The jitter enum for the exponential backoff algorithm.
	Written by: Nikita Petko
*/

/**
 * The jitter enum for the exponential backoff algorithm.
 */
export enum Jitter {
  /**
   * No jitter.
   */
  None = 0,

  /**
   * Full jitter.
   */
  Full = 1,

  /**
   * Equal jitter.
   */
  Equal = 2,
}
