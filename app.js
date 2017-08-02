const axios = require('axios')

const depo = {
  latitude: -37.816664,
  longitude: 144.9638476
}

const speed = 20 * 5 / 18

function getDrones () {
  return axios.get('https://codetest.kube.getswift.co/drones')
}

function getPackages () {
  return axios.get('https://codetest.kube.getswift.co/packages')
}

function genDroneAvailable (drone) {
  let distance
  if (!drone.packages.length) {
    distance = haversine(drone.location, depo)
  } else {
    distance = haversine(drone.location, drone.packages[0].destination)
    distance += haversine(drone.packages[0].destination, depo)
  }
  return Math.floor(Date.now() / 1000) + (distance / speed)
}

function getDepartureTime (p) {
  let pckg = {}
  Object.assign(pckg, p)
  let distance = haversine(pckg.destination, depo)
  pckg.travelTime = distance / speed
  pckg.departure = pckg.deadline - pckg.travelTime
  return pckg
}

function haversine (pointA, pointB) {
  const R = 6371e3
  const latA = pointA.latitude * Math.PI / 180
  const latB = pointB.latitude * Math.PI / 180
  const dLat = (pointB.latitude - pointA.latitude) * Math.PI / 180
  const dLng = (pointB.longitude - pointA.longitude) * Math.PI / 180

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(latA) * Math.cos(latB) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function assignPackages (pckgs, dronesAvailable) {
  let assignments = []
  let unassignedPackageIds = []
  pckgs.forEach(pckg => {
    if (pckg[process.argv[2] === 'dest' ? 'departure' : 'deadline'] < dronesAvailable[0].time || !dronesAvailable.length) {
      unassignedPackageIds.push(pckg.packageId)
    } else {
      let drone = dronesAvailable.shift()
      assignments.push({droneId: drone.droneId, packageId: pckg.packageId})
      // We could handle the subsequent return/redispatch of drones like so:
      // drone.time += pckg.travelTime * 2
      // dronesAvailable.push(drone)
      // dronesAvailable.sort((a, b) => a.time - b.time)
    }
  })
  return {assignments, unassignedPackageIds}
}

axios.all([getDrones(), getPackages()])
  .then(axios.spread((drones, packages) => {
    if (process.argv[2] === 'dest') {
      packages = packages.data
      .map(pckg => getDepartureTime(pckg))
      .sort((a, b) => a.departure - b.departure)
    } else {
      packages = packages.data
      .sort((a, b) => a.departure - b.departure)
    }

    let dronesAvailable = drones.data
      .map(drone => ({time: genDroneAvailable(drone), droneId: drone.droneId}))
      .sort((a, b) => a.time - b.time)

    let result = assignPackages(packages, dronesAvailable)

    console.log('RESULT\n****\nAssigned:', result.assignments, '\nUnassigned', result.unassignedPackageIds)
  }))
  .catch(err => {
    // I would handle errors properly in real code, promise!
    console.log('Error retrieving/processing drone data:', err)
  })
