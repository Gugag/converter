const conversionFactors = {
    length: {
        "Meter": 1,
        "Kilometer": 1000,
        "Centimeter": 0.01,
        "Millimeter": 0.001,
        "Micrometer": 0.000001,
        "Nanometer": 0.000000001,
        "Mile": 1609.34,
        "Yard": 0.9144,
        "Foot": 0.3048,
        "Inch": 0.0254,
        "Light Year": 9.461e+15
    },
    temperature: {
        "Celsius to Fahrenheit": (val) => (val * 9/5) + 32,
        "Fahrenheit to Celsius": (val) => (val - 32) * 5/9,
        "Celsius to Kelvin": (val) => val + 273.15,
        "Kelvin to Celsius": (val) => val - 273.15,
        "Fahrenheit to Kelvin": (val) => (val - 32) * 5/9 + 273.15,
        "Kelvin to Fahrenheit": (val) => (val - 273.15) * 9/5 + 32
    },
    area: {
        "Square Meter": 1,
        "Square Kilometer": 1e+6,
        "Square Centimeter": 0.0001,
        "Square Millimeter": 0.000001,
        "Square Micrometer": 1e-12,
        "Hectare": 10000,
        "Square Mile": 2.59e+6,
        "Square Yard": 0.836127,
        "Square Foot": 0.092903,
        "Square Inch": 0.00064516,
        "Acre": 4046.86
    },
    volume: {
        "Cubic Meter": 1,
        "Cubic Kilometer": 1e+9,
        "Cubic Centimeter": 0.000001,
        "Cubic Millimeter": 1e-9,
        "Liter": 0.001,
        "Milliliter": 0.000001,
        "US Gallon": 0.00378541,
        "US Quart": 0.000946353,
        "US Pint": 0.000473176,
        "US Cup": 0.000236588,
        "US Fluid Ounce": 0.0000295735
    },
    weight: {
        "Kilogram": 1,
        "Gram": 0.001,
        "Milligram": 1e-6,
        "Metric Ton": 1000,
        "Long Ton": 1016.05,
        "Short Ton": 907.185,
        "Pound": 0.453592,
        "Ounce": 0.0283495,
        "Carrat": 0.0002,
        "Atomic Mass Unit": 1.66053906660e-27
    },
    time: {
        "Second": 1,
        "Millisecond": 1e-3,
        "Microsecond": 1e-6,
        "Nanosecond": 1e-9,
        "Picosecond": 1e-12,
        "Minute": 60,
        "Hour": 3600,
        "Day": 86400,
        "Week": 604800,
        "Month": 2.63e+6,
        "Year": 3.156e+7
    }
};

function populateUnits() {
    const category = document.getElementById("category").value;
    const inputUnit = document.getElementById("inputUnit");
    const outputUnit = document.getElementById("outputUnit");

    inputUnit.innerHTML = '<option value="">--Select Unit--</option>';
    outputUnit.innerHTML = '<option value="">--Select Unit--</option>';

    if (category) {
        if (category === "temperature") {
            const units = ["Celsius", "Fahrenheit", "Kelvin"];
            units.forEach(unit => {
                inputUnit.innerHTML += `<option value="${unit}">${unit}</option>`;
                outputUnit.innerHTML += `<option value="${unit}">${unit}</option>`;
            });
        } else {
            const units = Object.keys(conversionFactors[category]);
            units.forEach(unit => {
                inputUnit.innerHTML += `<option value="${unit}">${unit}</option>`;
                outputUnit.innerHTML += `<option value="${unit}">${unit}</option>`;
            });
        }
    }
}

function convert() {
    const category = document.getElementById("category").value;
    const inputValue = parseFloat(document.getElementById("inputValue").value);
    const inputUnit = document.getElementById("inputUnit").value;
    const outputUnit = document.getElementById("outputUnit").value;
    const result = document.getElementById("result");

    if (category === "temperature") {
        if (inputUnit && outputUnit) {
            if (inputUnit === outputUnit) {
                result.textContent = `${inputValue} ${outputUnit}`;
            } else {
                const conversionFunc = conversionFactors.temperature[`${inputUnit} to ${outputUnit}`];
                if (conversionFunc) {
                    result.textContent = conversionFunc(inputValue).toFixed(2) + ` ${outputUnit}`;
                } else {
                    result.textContent = "Invalid conversion.";
                }
            }
        } else {
            result.textContent = "Please select both units.";
        }
    } else {
        if (inputUnit && outputUnit) {
            const inputFactor = conversionFactors[category][inputUnit];
            const outputFactor = conversionFactors[category][outputUnit];
            const convertedValue = inputValue * (inputFactor / outputFactor);
            result.textContent = convertedValue.toFixed(2) + ` ${outputUnit}`;
        } else {
            result.textContent = "Please select both units.";
        }
    }
}