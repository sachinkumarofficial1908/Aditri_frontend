import React from 'react';

const BonusConfig = ({ bonusConfig, setBonusConfig }) => {
  const handleBonusChange = (index, field, value) => {
    const updatedBonuses = [...bonusConfig.bonuses];
    updatedBonuses[index] = {
      ...updatedBonuses[index],
      [field]: field === 'percentage' ? parseFloat(value) : value,
    };
    setBonusConfig({ bonuses: updatedBonuses });
  };

  const handleAddBonus = () => {
    setBonusConfig({
      bonuses: [
        ...bonusConfig.bonuses,
        { name: 'New Bonus', percentage: 0 },
      ],
    });
  };

  const handleDeleteBonus = (index) => {
    const updatedBonuses = bonusConfig.bonuses.filter((_, i) => i !== index);
    setBonusConfig({ bonuses: updatedBonuses });
  };

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-purple-900 mb-4">Bonus Configuration</h3>

      <div className="space-y-4 mb-4">
        {bonusConfig.bonuses.map((bonus, index) => (
          <div key={index} className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bonus Name
              </label>
              <input
                type="text"
                value={bonus.name}
                onChange={(e) => handleBonusChange(index, 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                % of Total
              </label>
              <input
                type="number"
                value={bonus.percentage}
                onChange={(e) => handleBonusChange(index, 'percentage', e.target.value)}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              onClick={() => handleDeleteBonus(index)}
              className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={handleAddBonus}
        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-semibold"
      >
        + Add Bonus
      </button>
    </div>
  );
};

export default BonusConfig;
