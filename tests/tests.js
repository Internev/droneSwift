let assert = chai.assert

describe('Haversine', function () {
  it('should return correct distances', function () {
    let result = haversine({
            "latitude": -37.78290448241537,
            "longitude": 144.85335277520906
        }, {
            "latitude": -36.78290448241537,
            "longitude": 145.85335277520906
        })
    assert.equal(result, 142095.4474231141)
  })
})

describe('Drone Availability', function () {
  it('should correctly return current time if at depo', function () {
    let result = genDroneAvailable({
      droneId: 1,
      location: {
        latitude: -37.816664,
        longitude: 144.9638476
      },
      packages: []
    })
    assert.equal(result, Math.floor(Date.now() / 1000))
  })

  it('should return correct future time for availability if not at depo', function () {
    let result = genDroneAvailable({
      droneId: 1,
      location: {
        latitude: -38.816664,
        longitude: 144.9638476
      },
      packages: []
    })
    assert.equal(result, Math.floor(Date.now() / 1000) + (111194.92664455874 / (20 * 5 / 18)))
  })
})

describe('Departure Time', function () {
  it('should not modify deadline if location is depo', function () {
    let result = getDepartureTime({ destination: {
      latitude: -37.816664,
      longitude: 144.9638476
    },
    packageId: 666,
    deadline: 1501568953})
    assert.equal(result.deadline, result.departure)
    assert.equal(result.travelTime, 0)
  })

  it('should make depature time earlier than deadline by traveltime', function () {
    let result = getDepartureTime({ destination: {
      latitude: -38.816664,
      longitude: 144.9638476
    },
    packageId: 666,
    deadline: 1501568953})
    assert.equal(result.deadline - result.travelTime, result.departure)
  })
})

describe('Assign Packages', function () {
  it('should assign a package to an available drone', function () {
    let pckgs = [{ destination: { latitude: -37.78104947342697, longitude: 144.8500875034832 },
    packageId: 666,
    deadline: 100,
    travelTime: 50,
    departure: 50 }]
    let dronesAvail = [{ time: 10, droneId: 1 }]
    let result = assignPackages(pckgs, dronesAvail)
    assert.deepEqual(result, {assignments: [{droneId: 1, packageId: 666}], unassignedPackageIds: []})
  })

  it('should not assign a package to an unavailable drone', function () {
    let pckgs = [{ destination: { latitude: -37.78104947342697, longitude: 144.8500875034832 },
    packageId: 666,
    deadline: 100,
    travelTime: 50,
    departure: 50 }]
    let dronesAvail = [{ time: 100, droneId: 1 }]
    let result = assignPackages(pckgs, dronesAvail)
    assert.deepEqual(result, {assignments: [], unassignedPackageIds: [666]})
  })

  it('should assign packages to a drone if timing works out', function () {
    let pckgs = [
      { destination: { latitude: -37.78104947342697, longitude: 144.8500875034832 },
      packageId: 666,
      deadline: 100,
      travelTime: 50,
      departure: 50 },
      { destination: { latitude: -37.78104947342697, longitude: 144.8500875034832 },
      packageId: 111,
      deadline: 400,
      travelTime: 50,
      departure: 350 }
    ]
    let dronesAvail = [{ time: 10, droneId: 1 }]
    let result = assignPackages(pckgs, dronesAvail)
    assert.deepEqual(result, {assignments: [{droneId: 1, packageId: 666}, {droneId: 1, packageId: 111}], unassignedPackageIds: []})
  })

  it('should assign packages to first available drone', function () {
    let pckgs = [
      { destination: { latitude: -37.78104947342697, longitude: 144.8500875034832 },
      packageId: 666,
      deadline: 100,
      travelTime: 50,
      departure: 50 },
      { destination: { latitude: -37.78104947342697, longitude: 144.8500875034832 },
      packageId: 111,
      deadline: 400,
      travelTime: 50,
      departure: 350 }
    ]
    let dronesAvail = [{ time: 10, droneId: 1 }, { time: 15, droneId: 2}]
    let result = assignPackages(pckgs, dronesAvail)
    assert.deepEqual(result, {assignments: [{droneId: 1, packageId: 666}, {droneId: 2, packageId: 111}], unassignedPackageIds: []})
  })

  it('should assign packages to first available drone, time allowed.', function () {
    let pckgs = [
      { destination: { latitude: -37.78104947342697, longitude: 144.8500875034832 },
      packageId: 666,
      deadline: 100,
      travelTime: 50,
      departure: 50 },
      { destination: { latitude: -37.78104947342697, longitude: 144.8500875034832 },
      packageId: 111,
      deadline: 400,
      travelTime: 50,
      departure: 350 },
      { destination: { latitude: -37.78104947342697, longitude: 144.8500875034832 },
      packageId: 777,
      deadline: 55,
      travelTime: 50,
      departure: 5 }
    ]
    let dronesAvail = [{ time: 10, droneId: 1 }, { time: 15, droneId: 2}]
    let result = assignPackages(pckgs, dronesAvail)
    console.log(result)
    assert.deepEqual(result, {assignments: [{droneId: 1, packageId: 666}, {droneId: 2, packageId: 111}], unassignedPackageIds: [777]})
  })
})
