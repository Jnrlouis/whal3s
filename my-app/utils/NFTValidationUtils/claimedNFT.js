import {useState} from 'react';

// const [currentStep, setCurrentStep] = useState(undefined);
// const [isEngagement, setIsEngagement] = useState(false);
let currentStep;
let isEngagement;

export const checkingSteps = (step) => {
    console.log("Updating these steps...");
    // await setCurrentStep(step);
    currentStep = step;
    console.log("Current Step : ", currentStep);
    return currentStep;
}

export const claimed = () => {
    console.log("Current Step : ", currentStep);
    return currentStep;

}

export const checkingEngagement = (bool) => {
    isEngagement = bool;
    // await setIsEngagement(bool);
    console.log("Engaged ?: ", isEngagement);
    return isEngagement;
}

export const isEngaged = () => {
    console.log("Engaged ?: ", isEngagement);
    return isEngagement;
}

export function call () {
    isEngagement = true;
    currentStep = 6;
}
