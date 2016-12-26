/*
        Copyright (c) 2017 Jon Vadney
        Distributable under the terms of The "BSD New"" License
        that can be found in the LICENSE file, herein included
        as part of this header.

        training.go: Simulates data input to allow ground based training
*/

package main

import (
	"fmt"
        "log"
        "time"
)

var shutdownTraining bool
var shutdownComplete bool

func processTrainingLoop() {

	for !shutdownTraining { 
		if !globalSettings.Training_Enabled {
			time.Sleep(1 * time.Second)
			continue
		}

		numTargets := uint32(36)
		hexCode := uint32(0xFF0000)

		for i := uint32(0); i < numTargets; i++ {
			tail := fmt.Sprintf("DEMO%d", i)
			alt := float32((i*117%2000)*25 + 2000)
			hdg := int32((i * 149) % 360)
			spd := float64(50 + ((i*23)%13)*37)

			updateDemoTraffic(i|hexCode, tail, alt, spd, hdg)
		}
	}

	shutdownComplete = true
}

func trainingInit() {
	log.Println("Initializing training ...")
	shutdownTraining = false
	shutdownComplete = false;

	go processTrainingLoop()
}

func trainingKill() {
	log.Println("Begin training shutdown ...")
	shutdownTraining = true

	// Spin until all devices have been de-initialized.
	for !shutdownComplete {
		time.Sleep(1 * time.Second)
	}
	log.Println("Shutdown Complete")
}
