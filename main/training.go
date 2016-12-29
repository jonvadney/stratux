/*
        Copyright (c) 2017 Jon Vadney
        Distributable under the terms of The "BSD New"" License
        that can be found in the LICENSE file, herein included
        as part of this header.

        training.go: Simulates data input to allow ground based training
*/

package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"
)

type TrainingTraffic struct {
	Tail      string
	InitLat   float32
	InitLon   float32
	Alt       float32
	Hdg       int32
	Speed     float64
	Enabled   bool
}

type TrainingSettings struct {
	Traffic_Enabled  bool
	Traffic          []TrainingTraffic
}

const (
	trainingConfigLocation = "/etc/stratux-training.conf"
)

var shutdownTraining bool
var shutdownComplete bool

var globalTrainingSettings TrainingSettings

func defaultTrainingSettings() {
	globalTrainingSettings.Traffic_Enabled = false
	globalTrainingSettings.Traffic = make([]TrainingTraffic, 0)
}

func addTrainingTraffic(traffic TrainingTraffic) {

	mod := false
	for i, trainingTraffic := range globalTrainingSettings.Traffic {
		if traffic.Tail == trainingTraffic.Tail {
			mod = true
			globalTrainingSettings.Traffic[i] = traffic
		}
	}
	if !mod {
		globalTrainingSettings.Traffic = append(globalTrainingSettings.Traffic, traffic)
	}
}

func remoteTrainingTraffic(tail string) {
	//delete(globalTrainingSettings.Traffic, tail)
}

func processTrafficLoop() {

	for !shutdownTraining { 
		if !globalTrainingSettings.Traffic_Enabled {
			time.Sleep(1 * time.Second)
			continue
		}

		hexCode := uint32(0xFF0000)

		for i, traffic := range globalTrainingSettings.Traffic {
			if traffic.Enabled {
				tail := traffic.Tail
				alt := traffic.Alt
				hdg := traffic.Hdg
				spd := traffic.Speed

				updateDemoTraffic(uint32(i)|hexCode, tail, alt, spd, hdg)
			}
		}
		time.Sleep(1 * time.Second)
	}
	shutdownComplete = true
}

func trainingInit() {
	log.Println("Initializing training ...")
	shutdownTraining = false
	shutdownComplete = false

	readTrainingSettings()

	go processTrafficLoop()
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

func saveTrainingSettings() {
	fd, err := os.OpenFile(trainingConfigLocation, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, os.FileMode(0644))
	if err != nil {
		err_ret := fmt.Errorf("can't save training settings %s: %s", trainingConfigLocation, err.Error())
		addSystemError(err_ret)
		log.Printf("%s\n", err_ret.Error())
		return
	}
	defer fd.Close()
	jsonSettings, _ := json.Marshal(&globalTrainingSettings)
	fd.Write(jsonSettings)
	log.Printf("wrote training settings.\n")
}

func readTrainingSettings() {
	// Load default settings in case the file can't be read
	defaultTrainingSettings()

	fd, err := os.Open(trainingConfigLocation)
	buf := make([]byte, 1024)
	count, err := fd.Read(buf)
	if err != nil {
		log.Printf("can't read training settings %s: %s\n", trainingConfigLocation, err.Error())
		return
	}
	var newSettings TrainingSettings
	err = json.Unmarshal(buf[0:count], &newSettings)
	if err != nil {
		log.Printf("can't read training settings %s: %s\n", trainingConfigLocation, err.Error())
		return
	}
	globalTrainingSettings = newSettings
	log.Printf("read in training settings.\n")
}
