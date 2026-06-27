export const parseCurriculumCSV = async (csvString) => {
  // A simple synchronous CSV string parser instead of PapaParse for speed and no dependencies
  const lines = csvString.trim().split('\n');
  const headers = lines[0].split(',');
  
  const sectionsMap = new Map();
  let totalSubsections = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Handle quotes in CSV if any (simple approach)
    let current = '';
    const row = [];
    let inQuotes = false;
    for (let char of line) {
      if (char === '"') inQuotes = !inQuotes;
      else if (char === ',' && !inQuotes) {
        row.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    row.push(current);

    const sectionNum = row[0];
    const sectionName = row[1];
    const modNum = row[2];
    const modName = row[3];
    const subName = row[4];

    if (!sectionNum || !sectionName) continue;

    const sectionId = `section_${sectionNum}`;
    if (!sectionsMap.has(sectionId)) {
      sectionsMap.set(sectionId, {
        id: sectionId,
        title: sectionName,
        number: sectionNum,
        modules: new Map()
      });
    }

    const section = sectionsMap.get(sectionId);
    const modId = `${sectionId}_mod_${modNum}`;
    
    if (!section.modules.has(modId)) {
      section.modules.set(modId, {
        id: modId,
        title: modName,
        number: modNum,
        subsections: []
      });
    }

    const mod = section.modules.get(modId);
    const subId = `${modId}_sub_${mod.subsections.length + 1}`;
    
    mod.subsections.push({
      id: subId,
      title: subName,
      completed: false // state fetched later
    });
    totalSubsections++;
  }

  // Convert Maps to Arrays and calculate weights
  const result = Array.from(sectionsMap.values()).map(section => {
    const modulesArr = Array.from(section.modules.values());
    let sectionSubCount = 0;
    modulesArr.forEach(m => { sectionSubCount += m.subsections.length; });
    
    return {
      ...section,
      modules: modulesArr,
      subCount: sectionSubCount,
      weight: sectionSubCount / totalSubsections // global percentage weight
    };
  });

  return result;
};
